const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      brand, 
      status,
      lowStock 
    } = req.query;
    
    const query = {};
    
    // 搜索条件
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 分类筛选
    if (category) {
      query.category = category;
    }
    
    // 品牌筛选
    if (brand) {
      query.brand = brand;
    }
    
    // 状态筛选
    if (status) {
      query.status = status;
    }
    
    // 低库存筛选
    if (lowStock === 'true') {
      query.$expr = {
        $and: [
          { $ne: ['$stockAlert', null] },
          { $lte: ['$currentStock', '$stockAlert'] }
        ]
      };
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        products: products,
        total: total
      },
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取商品统计信息
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ status: 'active' });
    const lowStockProducts = await Product.countDocuments({
      status: 'active',
      $expr: {
        $and: [
          { $ne: ['$stockAlert', null] },
          { $lte: ['$currentStock', '$stockAlert'] }
        ]
      }
    });
    const outOfStockProducts = await Product.countDocuments({
      status: 'active',
      currentStock: 0
    });
    
    // 按分类统计
    const categoryStats = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // 按品牌统计
    const brandStats = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        categoryStats,
        brandStats
      }
    });
  } catch (error) {
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
  body('specification').notEmpty().withMessage('规格不能为空')
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
    const existingProduct = await Product.findOne({ 
      name: req.body.name,
      brand: req.body.brand
    });
    if (existingProduct) {
      console.log('商品已存在:', existingProduct);
      return res.status(400).json({ success: false, message: '该品牌下的商品名称已存在' });
    }

    const product = new Product({
      ...req.body,
      createdBy: req.user?.username || 'system'
    });

    console.log('准备保存商品:', product);
    const savedProduct = await product.save();
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: '数据验证失败',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    // 如果更新名称或品牌，检查是否与其他商品重复
    if ((req.body.name && req.body.name !== product.name) || 
        (req.body.brand && req.body.brand !== product.brand)) {
      const existingProduct = await Product.findOne({ 
        name: req.body.name || product.name,
        brand: req.body.brand || product.brand,
        _id: { $ne: req.params.id } 
      });
      if (existingProduct) {
        return res.status(400).json({ success: false, message: '该品牌下的商品名称已存在' });
      }
    }

    Object.assign(product, req.body, {
      updatedBy: req.user?.username || 'system'
    });

    await product.save();
    res.json({ success: true, data: product, message: '商品更新成功' });
  } catch (error) {
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
          updatedBy: req.user?.username || 'system'
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