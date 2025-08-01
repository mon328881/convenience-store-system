const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Supplier = require('../models/SupabaseSupplier');
const Inbound = require('../models/SupabaseInbound');

// 错误处理中间件
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 获取供应商列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const filters = {};
    
    // 搜索条件
    if (search) {
      filters.search = search;
    }
    
    const suppliers = await Supplier.find(filters);
    const total = await Supplier.countDocuments(filters);
    
    // 手动分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSuppliers = suppliers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedSuppliers,
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

// 根据商品ID获取相关供应商
router.get('/by-product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // 从供应商配置中查找与该商品有关联的供应商
    const suppliers = await Supplier.findByProductId(productId);
    
    if (suppliers.length === 0) {
      return res.json({ 
        success: true, 
        data: [],
        message: '该商品暂无配置的供应商' 
      });
    }
    
    res.json({ 
      success: true, 
      data: suppliers,
      message: `找到 ${suppliers.length} 个配置的供应商`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建供应商
router.post('/', [
  body('name').notEmpty().withMessage('供应商名称不能为空'),
  body('contact').notEmpty().withMessage('联系人不能为空'),
  body('phone').notEmpty().withMessage('联系电话不能为空'),
  body('address').optional().isString().withMessage('地址必须是字符串'),
  body('products').optional().isArray().withMessage('供货商品必须是数组'),
  body('paymentMethod').optional().isString().withMessage('付款方式必须是字符串'),
  body('needInvoice').optional().isBoolean().withMessage('是否开票必须是布尔值'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('状态必须是active或inactive'),
  body('notes').optional().isString().withMessage('备注必须是字符串')
], asyncHandler(async (req, res) => {
  console.log(`[SUPPLIER-CREATE] 开始创建供应商`);
  console.log(`[SUPPLIER-CREATE] 请求数据:`, JSON.stringify(req.body));
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(`[SUPPLIER-CREATE] 数据验证失败:`, errors.array());
    return res.status(400).json({ 
      success: false, 
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  // 检查供应商名称是否已存在
  console.log(`[SUPPLIER-CREATE] 检查名称重复: ${req.body.name}`);
  const existingSupplier = await Supplier.findByName(req.body.name);
  if (existingSupplier) {
    console.log(`[SUPPLIER-CREATE] 供应商名称已存在:`, existingSupplier);
    return res.status(400).json({ success: false, message: '供应商名称已存在' });
  }

  // 构建供应商数据
  const supplierData = {
    name: req.body.name,
    contact: req.body.contact,
    phone: req.body.phone,
    address: req.body.address || '',
    products: req.body.products || [],
    payment_method: req.body.paymentMethod || '',
    need_invoice: req.body.needInvoice || false,
    status: req.body.status || 'active',
    notes: req.body.notes || ''
  };

  console.log(`[SUPPLIER-CREATE] 准备创建数据:`, JSON.stringify(supplierData));
  const supplier = await Supplier.create(supplierData);
  console.log(`[SUPPLIER-CREATE] 创建成功:`, JSON.stringify(supplier));
  
  res.status(201).json({ success: true, data: supplier, message: '供应商创建成功' });
}));

// 更新供应商
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('供应商名称不能为空'),
  body('contact').optional().notEmpty().withMessage('联系人不能为空'),
  body('phone').optional().notEmpty().withMessage('联系电话不能为空'),
  body('address').optional().isString().withMessage('地址必须是字符串'),
  body('products').optional().isArray().withMessage('供货商品必须是数组'),
  body('paymentMethod').optional().isString().withMessage('付款方式必须是字符串'),
  body('needInvoice').optional().isBoolean().withMessage('是否开票必须是布尔值'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('状态必须是active或inactive'),
  body('notes').optional().isString().withMessage('备注必须是字符串')
], asyncHandler(async (req, res) => {
  console.log(`[SUPPLIER-UPDATE] 开始更新供应商，ID: ${req.params.id}`);
  console.log(`[SUPPLIER-UPDATE] 请求数据:`, JSON.stringify(req.body));
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(`[SUPPLIER-UPDATE] 数据验证失败:`, errors.array());
    return res.status(400).json({ 
      success: false, 
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  console.log(`[SUPPLIER-UPDATE] 查找供应商，ID: ${req.params.id}`);
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    console.log(`[SUPPLIER-UPDATE] 供应商不存在，ID: ${req.params.id}`);
    return res.status(404).json({ success: false, message: '供应商不存在' });
  }
  
  console.log(`[SUPPLIER-UPDATE] 找到供应商:`, supplier);

  // 如果更新名称，检查是否与其他供应商重复
  if (req.body.name && req.body.name !== supplier.name) {
    console.log(`[SUPPLIER-UPDATE] 检查名称重复，新名称: ${req.body.name}`);
    const existingSupplier = await Supplier.findByName(req.body.name);
    if (existingSupplier && existingSupplier.id !== parseInt(req.params.id)) {
      console.log(`[SUPPLIER-UPDATE] 供应商名称已存在:`, existingSupplier);
      return res.status(400).json({ success: false, message: '供应商名称已存在' });
    }
  }

  // 构建更新数据，只包含提供的字段
  const updateData = {};
  if (req.body.name !== undefined) updateData.name = req.body.name;
  if (req.body.contact !== undefined) updateData.contact = req.body.contact;
  if (req.body.phone !== undefined) updateData.phone = req.body.phone;
  if (req.body.address !== undefined) updateData.address = req.body.address;
  if (req.body.products !== undefined) updateData.products = req.body.products;
  if (req.body.paymentMethod !== undefined) updateData.payment_method = req.body.paymentMethod;
  if (req.body.needInvoice !== undefined) updateData.need_invoice = req.body.needInvoice;
  if (req.body.status !== undefined) updateData.status = req.body.status;
  if (req.body.notes !== undefined) updateData.notes = req.body.notes;
  
  console.log('[SUPPLIER-UPDATE] 准备更新数据:', updateData);
  
  // 更新供应商
  const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, updateData);
  console.log('[SUPPLIER-UPDATE] 更新成功:', updatedSupplier);
  
  res.json({ success: true, data: updatedSupplier, message: '供应商更新成功' });
}));

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

    const result = await Supplier.deleteMany(ids);
    res.json({ 
      success: true, 
      message: `成功删除 ${result.deletedCount} 个供应商` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;