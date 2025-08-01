const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/SupabaseProduct');

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    console.log('商品列表API - 收到请求，查询参数:', req.query);
    
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      brand, 
      status,
      lowStock,
      name // 添加name参数支持
    } = req.query;
    
    // 构建Supabase查询过滤条件
    const filters = {};
    
    if (search) {
      filters.search = search;
    }
    
    if (name) {
      filters.search = name; // 将name参数映射到search
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (brand) {
      filters.brand = brand;
    }
    
    if (status) {
      filters.status = status;
    }
    
    console.log('商品列表API - 构建的过滤条件:', filters);
    
    // 获取所有匹配的产品
    console.log('商品列表API - 开始查询商品...');
    const allProducts = await Product.find(filters);
    console.log('商品列表API - 查询完成，商品数量:', allProducts.length);
    
    // 如果需要低库存筛选，在应用层处理
    let filteredProducts = allProducts;
    if (lowStock === 'true') {
      console.log('商品列表API - 应用低库存筛选...');
      filteredProducts = allProducts.filter(product => 
        product.stock <= (product.stock_alert || 0)
      );
      console.log('商品列表API - 低库存筛选后商品数量:', filteredProducts.length);
    }
    
    // 计算分页
    const total = filteredProducts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    console.log('商品列表API - 分页信息:', {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      startIndex,
      endIndex,
      paginatedCount: paginatedProducts.length
    });
    
    const response = {
      success: true,
      data: paginatedProducts, // 直接返回商品数组，与前端期望的格式一致
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
    console.log('商品列表API - 准备返回响应，数据条数:', paginatedProducts.length);
    res.json(response);
  } catch (error) {
    console.error('获取商品列表失败:', error);
    console.error('错误详情:', error.stack);
    res.status(500).json({ success: false, message: `查询商品失败: ${error.message}` });
  }
});

// 获取商品统计信息
router.get('/stats', async (req, res) => {
  try {
    // 使用Supabase模型的统计方法
    const stats = await Product.getStats();
    
    // 获取分类和品牌统计（简化版本）
    const allProducts = await Product.find({ status: 'active' });
    
    // 计算分类统计
    const categoryStats = {};
    const brandStats = {};
    
    allProducts.forEach(product => {
      // 分类统计
      if (product.category) {
        categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
      }
      
      // 品牌统计
      if (product.brand) {
        brandStats[product.brand] = (brandStats[product.brand] || 0) + 1;
      }
    });
    
    // 转换为数组格式
    const categoryStatsArray = Object.entries(categoryStats).map(([name, count]) => ({ name, count }));
    const brandStatsArray = Object.entries(brandStats).map(([name, count]) => ({ name, count }));
    
    // 计算缺货商品数量
    const outOfStockProducts = allProducts.filter(product => product.stock === 0).length;
    
    res.json({
      success: true,
      data: {
        totalProducts: stats.totalProducts || 0,
        lowStockProducts: stats.lowStockCount || 0,
        outOfStockProducts: outOfStockProducts,
        categoryStats: categoryStatsArray,
        brandStats: brandStatsArray
      }
    });
  } catch (error) {
    console.error('获取商品统计失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建商品
router.post('/', [
  body('name').notEmpty().withMessage('商品名称不能为空'),
  body('brand').notEmpty().withMessage('品牌不能为空'),
  body('category').notEmpty().withMessage('商品分类不能为空'),
  body('purchasePrice').isFloat({ min: 0 }).withMessage('采购价必须为非负数'),
  body('retailPrice').isFloat({ min: 0 }).withMessage('零售价必须为非负数'),
  body('inputPrice').isFloat({ min: 0 }).withMessage('录入单价必须为非负数'),
  // body('specification').notEmpty().withMessage('规格不能为空') // 字段不存在，暂时注释
], async (req, res) => {
  try {
    console.log('收到创建商品请求:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('数据验证失败:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: '数据验证失败',
        errors: errors.array()
      });
    }

    // 检查商品名称+品牌是否已存在
    const existingProducts = await Product.find({ status: 'active' });
    const existingProduct = existingProducts.find(p => 
      p.name === req.body.name && p.brand === req.body.brand
    );
    
    if (existingProduct) {
      console.log('商品已存在:', existingProduct);
      return res.status(400).json({ success: false, message: '该品牌下的商品名称已存在' });
    }

    const productData = {
      ...req.body,
      created_by: req.user?.username || 'system'
    };

    console.log('准备保存商品:', productData);
    const savedProduct = await Product.create(productData);
    console.log('商品保存成功:', savedProduct);
    
    res.status(201).json({ success: true, data: savedProduct, message: '商品创建成功' });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新商品
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('商品名称不能为空'),
  body('brand').optional().notEmpty().withMessage('品牌不能为空'),
  body('category').optional().notEmpty().withMessage('商品分类不能为空'),
  body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('采购价必须为非负数'),
  body('retailPrice').optional().isFloat({ min: 0 }).withMessage('零售价必须为非负数'),
  body('inputPrice').optional().isFloat({ min: 0 }).withMessage('录入单价必须为非负数')
], async (req, res) => {
  try {
    console.log('收到更新商品请求:', req.params.id, req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('数据验证失败:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: '数据验证失败',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('商品不存在:', req.params.id);
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    // 如果更新名称或品牌，检查是否与其他商品重复
    if ((req.body.name && req.body.name !== product.name) || 
        (req.body.brand && req.body.brand !== product.brand)) {
      const allProducts = await Product.find({ status: 'active' });
      const existingProduct = allProducts.find(p => 
        p.name === (req.body.name || product.name) &&
        p.brand === (req.body.brand || product.brand) &&
        p.id !== req.params.id
      );
      
      if (existingProduct) {
        console.log('商品名称已存在:', existingProduct);
        return res.status(400).json({ success: false, message: '该品牌下的商品名称已存在' });
      }
    }

    const updateData = {
      ...req.body,
      updated_by: req.user?.username || 'system'
    };

    console.log('准备更新商品:', updateData);
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData);
    console.log('商品更新成功:', updatedProduct);
    
    res.json({ success: true, data: updatedProduct, message: '商品更新成功' });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '商品删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 批量更新库存预警值
router.patch('/batch-alert', [
  body('products').isArray().withMessage('商品列表必须为数组'),
  body('products.*.id').notEmpty().withMessage('商品ID不能为空'),
  body('products.*.stockAlert').isInt({ min: 0 }).withMessage('库存预警值必须为非负整数')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: '数据验证失败',
        errors: errors.array()
      });
    }

    const { products } = req.body;
    const updatePromises = products.map(item => 
      Product.findByIdAndUpdate(
        item.id, 
        { 
          stockAlert: item.stockAlert,
          updated_by: req.user?.username || 'system'
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);
    res.json({ success: true, message: '批量更新库存预警值成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;