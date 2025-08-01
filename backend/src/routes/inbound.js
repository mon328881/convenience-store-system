const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Inbound = require('../models/SupabaseInbound');
const Product = require('../models/SupabaseProduct');

// 获取入库记录列表
router.get('/', async (req, res) => {
  try {
    console.log('收到入库记录列表请求:', req.query);
    
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
    
    // 获取所有入库记录
    const allRecords = await Inbound.find();
    console.log('获取到入库记录数量:', allRecords.length);
    
    // 在应用层进行筛选
    let filteredInbounds = allRecords;
    
    // 状态筛选
    if (status) {
      filteredInbounds = filteredInbounds.filter(inbound => inbound.status === status);
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      filteredInbounds = filteredInbounds.filter(inbound => {
        const inboundDate = new Date(inbound.inboundDate);
        if (startDate && inboundDate < new Date(startDate)) return false;
        if (endDate && inboundDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // 商品筛选
    if (product) {
      filteredInbounds = filteredInbounds.filter(inbound => inbound.product === product);
    }
    
    // 供应商筛选
    if (supplier) {
      filteredInbounds = filteredInbounds.filter(inbound => inbound.supplier === supplier);
    }
    
    // 搜索筛选
    if (search) {
      filteredInbounds = filteredInbounds.filter(inbound => 
        inbound.notes?.toLowerCase().includes(search.toLowerCase()) ||
        inbound.batchNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 排序（按创建时间倒序）
    filteredInbounds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 分页
    const total = filteredInbounds.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedInbounds = filteredInbounds.slice(startIndex, endIndex);
    
    // 获取关联的产品信息并格式化数据
    const enrichedInbounds = paginatedInbounds.map(inbound => {
      // 从关联查询结果获取商品和供应商信息
      const productInfo = inbound.products;
      const supplierInfo = inbound.suppliers;
      
      return {
        id: inbound.id,
        productId: inbound.product_id,
        supplierId: inbound.supplier_id,
        quantity: inbound.quantity,
        unitPrice: inbound.unit_price,
        totalAmount: inbound.total_amount,
        inboundDate: inbound.date,
        notes: inbound.notes,
        createdAt: inbound.created_at,
        updatedAt: inbound.updated_at,
        // 商品信息 - 修复这里
        product: productInfo ? {
          id: productInfo.id,
          name: productInfo.name,
          brand: productInfo.brand,
          category: productInfo.category,
          specification: productInfo.specification,
          unit: productInfo.unit
        } : null,
        // 供应商信息
        supplier: supplierInfo ? {
          id: supplierInfo.id,
          name: supplierInfo.name,
          contact: supplierInfo.contact
        } : null,
        // 兼容前端的字段名
        productName: productInfo?.name,
        productBrand: productInfo?.brand,
        productSpecification: productInfo?.specification,
        unit: productInfo?.unit,
        supplierName: supplierInfo?.name,
        operator: 'system'
      };
    });
    
    res.json({
      success: true,
      data: enrichedInbounds,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取入库记录列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个入库记录
router.get('/:id', async (req, res) => {
  try {
    console.log('获取单个入库记录:', req.params.id);
    
    const inbound = await Inbound.findById(req.params.id);
    if (!inbound) {
      return res.status(404).json({ success: false, message: '入库记录不存在' });
    }
    
    // 获取关联的产品信息
    const product = await Product.findById(inbound.product);
    const enrichedInbound = {
      ...inbound,
      product: product ? {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        specification: product.specification,
        unit: product.unit
      } : null
    };
    
    res.json({ success: true, data: enrichedInbound });
  } catch (error) {
    console.error('获取单个入库记录失败:', error);
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

    // 使用 Supabase 模型创建入库记录
    const inboundData = {
      product_id: req.body.product,
      supplier_id: req.body.supplier,
      quantity: req.body.quantity,
      unit_price: req.body.unitPrice,
      date: req.body.inboundDate,
      notes: req.body.notes || ''
    };

    const newInbound = await Inbound.create(inboundData);

    // 更新商品库存
    const currentProduct = await Product.findById(req.body.product);
    if (currentProduct) {
      const newStock = (currentProduct.stock || 0) + req.body.quantity;
      await Product.findByIdAndUpdate(req.body.product, { stock: newStock });
    }

    res.status(201).json({ 
      success: true, 
      data: newInbound, 
      message: '入库记录创建成功' 
    });
  } catch (error) {
    console.error('创建入库记录失败:', error);
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
        product.stock = (product.stock || 0) + quantityDiff;
        await product.save();
      }
    }

    Object.assign(inbound, req.body, {
      updatedBy: req.user?.username || 'system'
    });

    await inbound.save();

    const populatedInbound = await Inbound.findById(inbound._id)
      .populate('product', 'name brand category specification unit')
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
      product.stock = Math.max(0, (product.stock || 0) - inbound.quantity);
      await product.save();
    }

    await Inbound.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '入库记录删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;