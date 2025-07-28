const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Outbound = require('../models/Outbound');
const Product = require('../models/Product');

// 获取出库记录列表
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status,
      outboundType,
      startDate,
      endDate,
      product
    } = req.query;
    
    const query = {};
    
    // 状态筛选
    if (status) {
      query.status = status;
    }
    
    // 出库类型筛选
    if (outboundType) {
      query.outboundType = outboundType;
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      query.outboundDate = {};
      if (startDate) {
        query.outboundDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.outboundDate.$lte = new Date(endDate);
      }
    }
    
    // 商品筛选
    if (product) {
      query.product = product;
    }
    
    // 搜索条件（客户名称）
    if (search) {
      query.customer = { $regex: search, $options: 'i' };
    }
    
    const outbounds = await Outbound.find(query)
      .populate('product', 'name brand category specification')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Outbound.countDocuments(query);
    
    res.json({
      success: true,
      data: outbounds,
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

// 获取单个出库记录
router.get('/:id', async (req, res) => {
  try {
    const outbound = await Outbound.findById(req.params.id)
      .populate('product', 'name brand category specification');
    
    if (!outbound) {
      return res.status(404).json({ success: false, message: '出库记录不存在' });
    }
    
    res.json({ success: true, data: outbound });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建出库记录
router.post('/', [
  body('product').notEmpty().withMessage('商品不能为空'),
  body('quantity').isInt({ min: 1 }).withMessage('出库数量必须为正整数'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('单价必须为非负数'),
  body('outboundDate').isISO8601().withMessage('出库日期格式不正确'),
  body('outboundType').isIn(['sale', 'return', 'damage', 'transfer', 'other']).withMessage('出库类型无效')
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

    // 检查库存是否充足
    if (product.currentStock < req.body.quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `库存不足，当前库存：${product.currentStock}，需要出库：${req.body.quantity}` 
      });
    }

    const outbound = new Outbound({
      ...req.body,
      createdBy: req.user?.username || 'system'
    });

    await outbound.save();

    // 更新商品库存
    product.currentStock = product.currentStock - req.body.quantity;
    await product.save();

    // 返回完整的出库记录（包含关联数据）
    const populatedOutbound = await Outbound.findById(outbound._id)
      .populate('product', 'name brand category specification');

    res.status(201).json({ 
      success: true, 
      data: populatedOutbound, 
      message: '出库记录创建成功' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新出库记录
router.put('/:id', [
  body('quantity').optional().isInt({ min: 1 }).withMessage('出库数量必须为正整数'),
  body('unitPrice').optional().isFloat({ min: 0 }).withMessage('单价必须为非负数'),
  body('outboundDate').optional().isISO8601().withMessage('出库日期格式不正确'),
  body('outboundType').optional().isIn(['sale', 'return', 'damage', 'transfer', 'other']).withMessage('出库类型无效')
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

    const outbound = await Outbound.findById(req.params.id);
    if (!outbound) {
      return res.status(404).json({ success: false, message: '出库记录不存在' });
    }

    // 如果修改了数量，需要更新商品库存
    if (req.body.quantity && req.body.quantity !== outbound.quantity) {
      const product = await Product.findById(outbound.product);
      if (product) {
        const quantityDiff = req.body.quantity - outbound.quantity;
        const newStock = product.currentStock - quantityDiff;
        
        if (newStock < 0) {
          return res.status(400).json({ 
            success: false, 
            message: `库存不足，当前库存：${product.currentStock}，调整后需要：${quantityDiff}` 
          });
        }
        
        product.currentStock = newStock;
        await product.save();
      }
    }

    Object.assign(outbound, req.body, {
      updatedBy: req.user?.username || 'system'
    });

    await outbound.save();

    const populatedOutbound = await Outbound.findById(outbound._id)
      .populate('product', 'name brand category specification');

    res.json({ success: true, data: populatedOutbound, message: '出库记录更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除出库记录
router.delete('/:id', async (req, res) => {
  try {
    const outbound = await Outbound.findById(req.params.id);
    if (!outbound) {
      return res.status(404).json({ success: false, message: '出库记录不存在' });
    }

    // 更新商品库存（恢复出库数量）
    const product = await Product.findById(outbound.product);
    if (product) {
      product.currentStock = (product.currentStock || 0) + outbound.quantity;
      await product.save();
    }

    await Outbound.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '出库记录删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;