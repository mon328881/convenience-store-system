const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Supplier = require('../models/Supplier');

// 获取供应商列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = {};
    
    // 搜索条件
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 状态筛选
    if (status) {
      query.status = status;
    }
    
    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Supplier.countDocuments(query);
    
    res.json({
      success: true,
      data: suppliers,
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

// 获取单个供应商
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: '供应商不存在' });
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建供应商
router.post('/', [
  body('name').notEmpty().withMessage('供应商名称不能为空'),
  body('contact').notEmpty().withMessage('联系人不能为空'),
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
  body('paymentMethod').isIn(['现金', '转账', '月结', '其他']).withMessage('付款方式无效')
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

    // 检查供应商名称是否已存在
    const existingSupplier = await Supplier.findOne({ name: req.body.name });
    if (existingSupplier) {
      return res.status(400).json({ success: false, message: '供应商名称已存在' });
    }

    const supplier = new Supplier({
      ...req.body,
      createdBy: req.user?.username || 'system'
    });

    await supplier.save();
    res.status(201).json({ success: true, data: supplier, message: '供应商创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新供应商
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('供应商名称不能为空'),
  body('contact').optional().notEmpty().withMessage('联系人不能为空'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
  body('paymentMethod').optional().isIn(['现金', '转账', '月结', '其他']).withMessage('付款方式无效')
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

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: '供应商不存在' });
    }

    // 如果更新名称，检查是否与其他供应商重复
    if (req.body.name && req.body.name !== supplier.name) {
      const existingSupplier = await Supplier.findOne({ 
        name: req.body.name, 
        _id: { $ne: req.params.id } 
      });
      if (existingSupplier) {
        return res.status(400).json({ success: false, message: '供应商名称已存在' });
      }
    }

    Object.assign(supplier, req.body, {
      updatedBy: req.user?.username || 'system'
    });

    await supplier.save();
    res.json({ success: true, data: supplier, message: '供应商更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除供应商
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: '供应商不存在' });
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '供应商删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 批量删除供应商
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '请提供要删除的供应商ID列表' });
    }

    const result = await Supplier.deleteMany({ _id: { $in: ids } });
    res.json({ 
      success: true, 
      message: `成功删除 ${result.deletedCount} 个供应商` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;