const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Outbound = require('../models/SupabaseOutbound');
const Product = require('../models/SupabaseProduct');

// 获取出库记录列表
router.get('/', async (req, res) => {
  try {
    console.log('收到出库记录列表请求:', req.query);
    
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
    
    // 获取所有出库记录
    const allRecords = await Outbound.find();
    console.log('获取到出库记录数量:', allRecords.length);
    
    // 在应用层进行筛选
    let filteredOutbounds = allRecords;
    
    // 状态筛选
    if (status) {
      filteredOutbounds = filteredOutbounds.filter(outbound => outbound.status === status);
    }
    
    // 出库类型筛选
    if (outboundType) {
      filteredOutbounds = filteredOutbounds.filter(outbound => outbound.outboundType === outboundType);
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      filteredOutbounds = filteredOutbounds.filter(outbound => {
        const outboundDate = new Date(outbound.outboundDate);
        if (startDate && outboundDate < new Date(startDate)) return false;
        if (endDate && outboundDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // 商品筛选
    if (product) {
      filteredOutbounds = filteredOutbounds.filter(outbound => outbound.product === product);
    }
    
    // 搜索条件（客户名称）
    if (search) {
      filteredOutbounds = filteredOutbounds.filter(outbound => 
        outbound.customer?.toLowerCase().includes(search.toLowerCase()) ||
        outbound.notes?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 排序（按创建时间倒序）
    filteredOutbounds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 分页
    const total = filteredOutbounds.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOutbounds = filteredOutbounds.slice(startIndex, endIndex);
    
    // 获取关联的产品信息并格式化数据
    const enrichedOutbounds = paginatedOutbounds.map(outbound => {
      // 从关联查询结果获取商品信息
      const productInfo = outbound.products;
      
      return {
        id: outbound.id,
        productId: outbound.product_id,
        quantity: outbound.quantity,
        unitPrice: outbound.unit_price,
        totalAmount: outbound.total_amount,
        outboundDate: outbound.date,
        outboundType: outbound.outbound_type || 'sale',
        customerName: outbound.customer_name,
        notes: outbound.notes,
        createdAt: outbound.created_at,
        updatedAt: outbound.updated_at,
        status: outbound.status,
        // 商品信息
        product: productInfo ? {
          id: productInfo.id,
          name: productInfo.name,
          brand: productInfo.brand,
          category: productInfo.category,
          specification: productInfo.specification,
          unit: productInfo.unit
        } : null,
        // 兼容前端的字段名
        productName: productInfo?.name,
        productBrand: productInfo?.brand,
        productSpecification: productInfo?.specification,
        unit: productInfo?.unit,
        createdBy: 'system',
        remark: outbound.notes
      };
    });
    
    res.json({
      success: true,
      data: enrichedOutbounds,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取出库记录列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个出库记录
router.get('/:id', async (req, res) => {
  try {
    console.log('获取单个出库记录:', req.params.id);
    
    const outbound = await Outbound.findById(req.params.id);
    if (!outbound) {
      return res.status(404).json({ success: false, message: '出库记录不存在' });
    }
    
    // 获取关联的产品信息
    const product = await Product.findById(outbound.product);
    const enrichedOutbound = {
      ...outbound,
      product: product ? {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        specification: product.specification,
        unit: product.unit
      } : null
    };
    
    res.json({ success: true, data: enrichedOutbound });
  } catch (error) {
    console.error('获取单个出库记录失败:', error);
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
    if (product.stock < req.body.quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `库存不足，当前库存：${product.stock}，需要出库：${req.body.quantity}` 
      });
    }

    const outbound = new Outbound({
      ...req.body,
      createdBy: req.user?.username || 'system'
    });

    await outbound.save();

    // 更新商品库存
    product.stock = product.stock - req.body.quantity;
    await product.save();

    // 返回完整的出库记录（包含关联数据）
    const populatedOutbound = await Outbound.findById(outbound._id)
      .populate('product', 'name brand category specification unit');

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
        const newStock = product.stock - quantityDiff;
        
        if (newStock < 0) {
          return res.status(400).json({ 
            success: false, 
            message: `库存不足，当前库存：${product.stock}，调整后需要：${quantityDiff}` 
          });
        }
        
        product.stock = newStock;
        await product.save();
      }
    }

    Object.assign(outbound, req.body, {
      updatedBy: req.user?.username || 'system'
    });

    await outbound.save();

    const populatedOutbound = await Outbound.findById(outbound._id)
      .populate('product', 'name brand category specification unit');

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
      product.stock = (product.stock || 0) + outbound.quantity;
      await product.save();
    }

    await Outbound.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '出库记录删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;