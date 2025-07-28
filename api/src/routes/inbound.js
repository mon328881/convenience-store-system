const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Inbound = require('../models/Inbound');
const Product = require('../models/Product');

// 获取入库记录列表
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status,
      startDate,
      endDate,
      product,
      supplier
    } = req.query;
    
    const query = {};
    
    // 状态筛选
    if (status) {
      query.status = status;
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      query.inboundDate = {};
      if (startDate) {
        query.inboundDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.inboundDate.$lte = new Date(endDate);
      }
    }
    
    // 商品筛选
    if (product) {
      query.product = product;
    }
    
    // 供应商筛选
    if (supplier) {
      query.supplier = supplier;
    }
    
    const inbounds = await Inbound.find(query)
      .populate('product', 'name brand category specification')
      .populate('supplier', 'name contact')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Inbound.countDocuments(query);
    
    res.json({
      success: true,
      data: inbounds,
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

// 获取单个入库记录
router.get('/:id', async (req, res) => {
  try {
    const inbound = await Inbound.findById(req.params.id)
      .populate('product', 'name brand category specification')
      .populate('supplier', 'name contact');
    
    if (!inbound) {
      return res.status(404).json({ success: false, message: '入库记录不存在' });
    }
    
    res.json({ success: true, data: inbound });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建入库记录
router.post('/', [
  body('product').notEmpty().withMessage('商品不能为空'),
  body('supplier').notEmpty().withMessage('供应商不能为空'),
  body('quantity').isInt({ min: 1 }).withMessage('入库数量必须为正整数'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('单价必须为非负数'),
  body('inboundDate').isISO8601().withMessage('入库日期格式不正确')
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

    // 检查商品是否存在
    const product = await Product.findById(req.body.product);
    if (!product) {
      return res.status(400).json({ success: false, message: '商品不存在' });
    }

    const inbound = new Inbound({
      ...req.body,
      createdBy: req.user?.username || 'system'
    });

    await inbound.save();

    // 更新商品库存
    product.currentStock = (product.currentStock || 0) + req.body.quantity;
    await product.save();

    // 返回完整的入库记录（包含关联数据）
    const populatedInbound = await Inbound.findById(inbound._id)
      .populate('product', 'name brand category specification')
      .populate('supplier', 'name contact');

    res.status(201).json({ 
      success: true, 
      data: populatedInbound, 
      message: '入库记录创建成功' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新入库记录
router.put('/:id', [
  body('quantity').optional().isInt({ min: 1 }).withMessage('入库数量必须为正整数'),
  body('unitPrice').optional().isFloat({ min: 0 }).withMessage('单价必须为非负数'),
  body('inboundDate').optional().isISO8601().withMessage('入库日期格式不正确')
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

    const inbound = await Inbound.findById(req.params.id);
    if (!inbound) {
      return res.status(404).json({ success: false, message: '入库记录不存在' });
    }

    // 如果修改了数量，需要更新商品库存
    if (req.body.quantity && req.body.quantity !== inbound.quantity) {
      const product = await Product.findById(inbound.product);
      if (product) {
        const quantityDiff = req.body.quantity - inbound.quantity;
        product.currentStock = (product.currentStock || 0) + quantityDiff;
        await product.save();
      }
    }

    Object.assign(inbound, req.body, {
      updatedBy: req.user?.username || 'system'
    });

    await inbound.save();

    const populatedInbound = await Inbound.findById(inbound._id)
      .populate('product', 'name brand category specification')
      .populate('supplier', 'name contact');

    res.json({ success: true, data: populatedInbound, message: '入库记录更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除入库记录
router.delete('/:id', async (req, res) => {
  try {
    const inbound = await Inbound.findById(req.params.id);
    if (!inbound) {
      return res.status(404).json({ success: false, message: '入库记录不存在' });
    }

    // 更新商品库存（减去入库数量）
    const product = await Product.findById(inbound.product);
    if (product) {
      product.currentStock = Math.max(0, (product.currentStock || 0) - inbound.quantity);
      await product.save();
    }

    await Inbound.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '入库记录删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;