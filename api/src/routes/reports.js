const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Inbound = require('../models/Inbound');
const Outbound = require('../models/Outbound');

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    // 使用 Promise.allSettled 来确保即使某个查询失败，其他查询仍能继续
    const results = await Promise.allSettled([
      Product.countDocuments({ status: 'active' }),
      Supplier.countDocuments({ status: 'active' }),
      Product.countDocuments({
        status: 'active',
        $expr: {
          $and: [
            { $ne: ['$stockAlert', null] },
            { $lte: ['$currentStock', '$stockAlert'] }
          ]
        }
      }),
      Product.countDocuments({
        status: 'active',
        currentStock: 0
      }),
      // 热销商品（基于出库数量）- 添加更多错误处理
      Outbound.aggregate([
        { 
          $match: { 
            status: 'completed',
            outboundType: 'sale'
          } 
        },
        { 
          $group: { 
            _id: '$product', 
            totalQuantity: { $sum: '$quantity' },
            totalAmount: { $sum: '$totalAmount' }
          } 
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ['$product.name', '未知商品'] },
            brand: { $ifNull: ['$product.brand', '未知品牌'] },
            quantity: '$totalQuantity',
            amount: '$totalAmount'
          }
        }
      ]),
      // 库存预警商品
      Product.find({
        status: 'active',
        $expr: {
          $and: [
            { $ne: ['$stockAlert', null] },
            { $lte: ['$currentStock', '$stockAlert'] }
          ]
        }
      }).select('name brand currentStock stockAlert').limit(10)
    ]);

    // 处理查询结果，即使某些查询失败也能返回部分数据
    const [
      totalProductsResult,
      totalSuppliersResult,
      lowStockProductsResult,
      outOfStockProductsResult,
      hotProductsResult,
      lowStockItemsResult
    ] = results;

    const responseData = {
      totalProducts: totalProductsResult.status === 'fulfilled' ? totalProductsResult.value : 0,
      totalSuppliers: totalSuppliersResult.status === 'fulfilled' ? totalSuppliersResult.value : 0,
      lowStockProducts: lowStockProductsResult.status === 'fulfilled' ? lowStockProductsResult.value : 0,
      outOfStockProducts: outOfStockProductsResult.status === 'fulfilled' ? outOfStockProductsResult.value : 0,
      hotProducts: hotProductsResult.status === 'fulfilled' ? hotProductsResult.value : [],
      lowStockItems: lowStockItemsResult.status === 'fulfilled' ? lowStockItemsResult.value : []
    };

    // 记录失败的查询
    const failedQueries = results.filter(result => result.status === 'rejected');
    if (failedQueries.length > 0) {
      console.warn('部分统计查询失败:', failedQueries.map(f => f.reason?.message).join(', '));
    }

    res.json({
      success: true,
      data: responseData,
      message: '统计数据获取成功',
      warnings: failedQueries.length > 0 ? `${failedQueries.length} 个查询失败` : undefined
    });
  } catch (error) {
    console.error('统计数据查询失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取统计数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// 获取分类统计
router.get('/category-stats', async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      { $match: { status: 'active' } },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          totalStock: { $sum: '$currentStock' }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categoryStats || [],
      message: '分类统计获取成功'
    });
  } catch (error) {
    console.error('分类统计查询失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取分类统计失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// 获取品牌统计
router.get('/brand-stats', async (req, res) => {
  try {
    const brandStats = await Product.aggregate([
      { $match: { status: 'active' } },
      { 
        $group: { 
          _id: '$brand', 
          count: { $sum: 1 },
          totalStock: { $sum: '$currentStock' }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: brandStats || [],
      message: '品牌统计获取成功'
    });
  } catch (error) {
    console.error('品牌统计查询失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取品牌统计失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// 获取销售趋势（基于出库记录）
router.get('/sales-trend', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);
    
    // 验证输入参数
    if (isNaN(daysNum) || daysNum <= 0 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        message: '天数参数无效，必须是1-365之间的数字'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const salesTrend = await Outbound.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          status: 'completed',
          outboundType: 'sale'
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalAmount: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: salesTrend || [],
      message: '销售趋势获取成功'
    });
  } catch (error) {
    console.error('销售趋势查询失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取销售趋势失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// 兼容旧的根路由
router.get('/', async (req, res) => {
  try {
    // 使用 Promise.allSettled 来确保即使某个查询失败，其他查询仍能继续
    const results = await Promise.allSettled([
      Product.countDocuments({ status: 'active' }),
      Supplier.countDocuments({ status: 'active' }),
      Product.countDocuments({
        status: 'active',
        $expr: {
          $and: [
            { $ne: ['$stockAlert', null] },
            { $lte: ['$currentStock', '$stockAlert'] }
          ]
        }
      }),
      Product.countDocuments({
        status: 'active',
        currentStock: 0
      }),
      // 修复热销商品查询 - 使用正确的数据结构
      Outbound.aggregate([
        { 
          $match: { 
            status: 'completed',
            outboundType: 'sale'
          } 
        },
        { 
          $group: { 
            _id: '$product', 
            totalQuantity: { $sum: '$quantity' },
            totalAmount: { $sum: '$totalAmount' }
          } 
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ['$product.name', '未知商品'] },
            brand: { $ifNull: ['$product.brand', '未知品牌'] },
            quantity: '$totalQuantity',
            amount: '$totalAmount'
          }
        }
      ]),
      // 库存预警商品查询
      Product.find({
        status: 'active',
        $expr: {
          $and: [
            { $ne: ['$stockAlert', null] },
            { $lte: ['$currentStock', '$stockAlert'] }
          ]
        }
      }).select('name brand currentStock stockAlert').limit(10)
    ]);

    // 处理查询结果，即使某些查询失败也能返回部分数据
    const [
      totalProductsResult,
      totalSuppliersResult,
      lowStockProductsResult,
      outOfStockProductsResult,
      hotProductsResult,
      lowStockItemsResult
    ] = results;

    const responseData = {
      totalProducts: totalProductsResult.status === 'fulfilled' ? totalProductsResult.value : 0,
      totalSuppliers: totalSuppliersResult.status === 'fulfilled' ? totalSuppliersResult.value : 0,
      lowStockProducts: lowStockProductsResult.status === 'fulfilled' ? lowStockProductsResult.value : 0,
      outOfStockProducts: outOfStockProductsResult.status === 'fulfilled' ? outOfStockProductsResult.value : 0,
      hotProducts: hotProductsResult.status === 'fulfilled' ? hotProductsResult.value : [],
      lowStockItems: lowStockItemsResult.status === 'fulfilled' ? lowStockItemsResult.value : []
    };

    // 记录失败的查询
    const failedQueries = results.filter(result => result.status === 'rejected');
    if (failedQueries.length > 0) {
      console.warn('部分查询失败:', failedQueries.map(f => f.reason?.message).join(', '));
    }

    res.json({
      success: true,
      data: responseData,
      message: '统计数据获取成功',
      warnings: failedQueries.length > 0 ? `${failedQueries.length} 个查询失败` : undefined
    });
  } catch (error) {
    console.error('报表统计查询失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取统计数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

module.exports = router;