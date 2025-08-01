const express = require('express');
const router = express.Router();
const Product = require('../models/SupabaseProduct');
const Supplier = require('../models/SupabaseSupplier');
const Inbound = require('../models/SupabaseInbound');
const Outbound = require('../models/SupabaseOutbound');

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    // 使用 Promise.allSettled 来确保即使某个查询失败，其他查询仍能继续
    const results = await Promise.allSettled([
      Product.countDocuments({ status: 'active' }),
      Supplier.countDocuments(),
      Product.countDocuments({
        status: 'active',
        stock: 0
      }),
      // 热销商品（基于出库数量）
      Outbound.getHotProducts(10),
      // 库存预警商品
      Product.getLowStockItems(10)
    ]);

    // 处理查询结果，即使某些查询失败也能返回部分数据
    const [
      totalProductsResult,
      totalSuppliersResult,
      outOfStockProductsResult,
      hotProductsResult,
      lowStockItemsResult
    ] = results;

    // 获取库存不足商品数量
    let lowStockProducts = 0;
    try {
      const lowStockItems = await Product.getLowStockProducts();
      lowStockProducts = lowStockItems.length;
    } catch (error) {
      console.warn('获取库存不足商品数量失败:', error.message);
    }

    const responseData = {
      totalProducts: totalProductsResult.status === 'fulfilled' ? totalProductsResult.value : 0,
      totalSuppliers: totalSuppliersResult.status === 'fulfilled' ? totalSuppliersResult.value : 0,
      lowStockProducts,
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
    console.log('开始获取分类统计...');
    const categoryStats = await Product.getCategoryStats();
    console.log('分类统计结果:', categoryStats);
    
    res.json({
      success: true,
      data: categoryStats,
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
    console.log('开始获取品牌统计...');
    const brandStats = await Product.getBrandStats();
    console.log('品牌统计结果:', brandStats);
    
    res.json({
      success: true,
      data: brandStats,
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

// 获取销售趋势
router.get('/sales-trend', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const salesTrend = await Outbound.getSalesTrend(parseInt(days));
    
    res.json({
      success: true,
      data: salesTrend,
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

// 获取库存报表
router.get('/inventory', async (req, res) => {
  try {
    console.log('开始获取库存报表数据...');
    
    // 获取所有商品的库存信息
    const products = await Product.getAll();
    
    // 计算库存统计
    let totalProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalStockValue = 0;
    
    const inventoryData = products.map(product => {
      const currentStock = product.stock || 0;
      const stockAlert = product.stock_alert || 0;
      const isLowStock = currentStock <= stockAlert && currentStock > 0;
      const isOutOfStock = currentStock === 0;
      
      totalProducts++;
      if (isLowStock) lowStockProducts++;
      if (isOutOfStock) outOfStockProducts++;
      
      // 计算库存价值（假设有成本价字段）
      const stockValue = currentStock * (product.cost_price || product.price || 0);
      totalStockValue += stockValue;
      
      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        currentStock: currentStock,
        stockAlert: stockAlert,
        unit: product.unit || '件',
        price: product.price || 0,
        costPrice: product.cost_price || product.price || 0,
        stockValue: stockValue,
        status: isOutOfStock ? 'out_of_stock' : (isLowStock ? 'low_stock' : 'normal'),
        lastUpdated: product.updated_at || product.created_at
      };
    });
    
    // 按库存状态排序：缺货 > 库存不足 > 正常
    inventoryData.sort((a, b) => {
      const statusOrder = { 'out_of_stock': 0, 'low_stock': 1, 'normal': 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.currentStock - b.currentStock;
    });
    
    const summary = {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      normalStockProducts: totalProducts - lowStockProducts - outOfStockProducts,
      totalStockValue: Math.round(totalStockValue * 100) / 100
    };
    
    console.log('库存报表数据获取完成:', { 
      总商品数: summary.totalProducts,
      库存不足: summary.lowStockProducts,
      缺货商品: summary.outOfStockProducts,
      库存总价值: summary.totalStockValue
    });
    
    res.json({
      success: true,
      data: {
        summary,
        inventory: inventoryData
      },
      message: '库存报表获取成功'
    });
  } catch (error) {
    console.error('库存报表查询失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取库存报表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// Dashboard接口 - 优化版本
router.get('/dashboard', async (req, res) => {
  try {
    console.log('开始获取dashboard数据...');
    
    // 分步获取数据，便于调试
    let totalProducts = 0;
    let totalSuppliers = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let hotProducts = [];
    let lowStockItems = [];

    // 1. 获取商品总数
    try {
      totalProducts = await Product.countDocuments({ status: 'active' });
      console.log('商品总数:', totalProducts);
    } catch (error) {
      console.error('获取商品总数失败:', error.message);
    }

    // 2. 获取供应商总数
    try {
      totalSuppliers = await Supplier.countDocuments();
      console.log('供应商总数:', totalSuppliers);
    } catch (error) {
      console.error('获取供应商总数失败:', error.message);
    }

    // 3. 获取库存预警商品数量
    try {
      const lowStockList = await Product.getLowStockProducts();
      lowStockProducts = lowStockList.length;
      console.log('库存预警商品数量:', lowStockProducts);
    } catch (error) {
      console.error('获取库存预警商品失败:', error.message);
    }

    // 4. 获取缺货商品数量
    try {
      outOfStockProducts = await Product.countDocuments({ status: 'active', stock: 0 });
      console.log('缺货商品数量:', outOfStockProducts);
    } catch (error) {
      console.error('获取缺货商品数量失败:', error.message);
    }

    // 5. 获取热销商品
    try {
      hotProducts = await Outbound.getHotProducts(10);
      console.log('热销商品数量:', hotProducts.length);
    } catch (error) {
      console.error('获取热销商品失败:', error.message);
      hotProducts = [];
    }

    // 6. 获取库存预警商品详情
    try {
      lowStockItems = await Product.getLowStockItems(10);
      console.log('库存预警商品详情数量:', lowStockItems.length);
    } catch (error) {
      console.error('获取库存预警商品详情失败:', error.message);
      lowStockItems = [];
    }

    const responseData = {
      totalProducts,
      totalSuppliers,
      lowStockProducts,
      outOfStockProducts,
      hotProducts,
      lowStockItems
    };

    console.log('Dashboard数据获取完成:', responseData);

    res.json({
      success: true,
      data: responseData,
      message: '仪表板数据获取成功'
    });
  } catch (error) {
    console.error('仪表板数据查询失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取仪表板数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// 根路由 - 兼容处理
router.get('/', async (req, res) => {
  try {
    // 获取基础统计数据
    const [
      totalProducts,
      totalSuppliers,
      outOfStockProducts,
      hotProducts,
      lowStockItems
    ] = await Promise.allSettled([
      Product.countDocuments({ status: 'active' }),
      Supplier.countDocuments(),
      Product.countDocuments({ status: 'active', stock: 0 }),
      Outbound.getHotProducts(5),
      Product.getLowStockItems(5)
    ]);

    // 获取库存不足商品数量
    let lowStockProducts = 0;
    try {
      const lowStockList = await Product.getLowStockProducts();
      lowStockProducts = lowStockList.length;
    } catch (error) {
      console.warn('获取库存不足商品数量失败:', error.message);
    }

    const dashboardData = {
      totalProducts: totalProducts.status === 'fulfilled' ? totalProducts.value : 0,
      totalSuppliers: totalSuppliers.status === 'fulfilled' ? totalSuppliers.value : 0,
      lowStockProducts,
      outOfStockProducts: outOfStockProducts.status === 'fulfilled' ? outOfStockProducts.value : 0,
      hotProducts: hotProducts.status === 'fulfilled' ? hotProducts.value : [],
      lowStockItems: lowStockItems.status === 'fulfilled' ? lowStockItems.value : []
    };

    res.json({
      success: true,
      data: dashboardData,
      message: '仪表板数据获取成功'
    });
  } catch (error) {
    console.error('仪表板数据查询失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取仪表板数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

module.exports = router;