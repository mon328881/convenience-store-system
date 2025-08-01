const { Hono } = require('hono');
const { cors } = require('hono/cors');
const mongoose = require('mongoose');

// 创建Hono应用实例
const app = new Hono();

// CORS配置
app.use('*', cors({
  origin: ['https://*.edgeone.app', 'https://localhost:5173', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// MongoDB连接管理
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 30000,
      bufferCommands: false,
    });
    isConnected = true;
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    throw error;
  }
};

// 模拟数据
const mockProducts = [
  {
    "_id": "1",
    "name": "可口可乐",
    "brand": "可口可乐",
    "category": "饮料",
    "specification": "330ml",
    "purchasePrice": 2.5,
    "inputPrice": 3,
    "retailPrice": 3.5,
    "currentStock": 120,
    "stockAlert": 20,
    "unit": "瓶",
    "status": "active",
    "barcode": "1234567890123",
    "createdAt": "2025-07-29T15:06:49.314Z",
    "createdBy": "system"
  },
  {
    "_id": "2",
    "name": "薯片",
    "brand": "乐事",
    "category": "零食",
    "specification": "70g",
    "purchasePrice": 4,
    "inputPrice": 5,
    "retailPrice": 6,
    "currentStock": 80,
    "stockAlert": 15,
    "unit": "包",
    "status": "active",
    "barcode": "2345678901234",
    "createdAt": "2025-07-29T15:06:49.316Z",
    "createdBy": "system"
  },
  {
    "_id": "3",
    "name": "洗发水",
    "brand": "海飞丝",
    "category": "日用品",
    "specification": "400ml",
    "purchasePrice": 15,
    "inputPrice": 18,
    "retailPrice": 22,
    "currentStock": 5,
    "stockAlert": 10,
    "unit": "瓶",
    "status": "active",
    "barcode": "3456789012345",
    "createdAt": "2025-07-29T15:06:49.316Z",
    "createdBy": "system"
  },
  {
    "_id": "4",
    "name": "中华烟",
    "brand": "中华",
    "category": "烟酒",
    "specification": "20支装",
    "purchasePrice": 45,
    "inputPrice": 50,
    "retailPrice": 55,
    "currentStock": 30,
    "stockAlert": 5,
    "unit": "包",
    "status": "active",
    "barcode": "4567890123456",
    "createdAt": "2025-07-29T15:06:49.316Z",
    "createdBy": "system"
  },
  {
    "_id": "5",
    "name": "矿泉水",
    "brand": "农夫山泉",
    "category": "饮料",
    "specification": "550ml",
    "purchasePrice": 1.5,
    "inputPrice": 2,
    "retailPrice": 2.5,
    "currentStock": 200,
    "stockAlert": 50,
    "unit": "瓶",
    "status": "active",
    "barcode": "5678901234567",
    "createdAt": "2025-07-29T15:06:49.316Z",
    "createdBy": "system"
  }
];

const mockSuppliers = [
  {
    "_id": "1",
    "name": "北京食品供应商",
    "contact": "张三",
    "phone": "13800138001",
    "products": ["可口可乐"],
    "paymentMethod": "无数据",
    "hasInvoice": true,
    "address": "北京市朝阳区xxx路xxx号",
    "remark": "主要供应饮料类商品",
    "status": "active",
    "createdAt": "2025-07-29T15:06:49.318Z",
    "createdBy": "system"
  },
  {
    "_id": "2",
    "name": "上海零食批发商",
    "contact": "李四",
    "phone": "13900139002",
    "products": ["薯片"],
    "paymentMethod": "月结",
    "hasInvoice": false,
    "address": "上海市浦东新区xxx路xxx号",
    "remark": "零食类商品供应商",
    "status": "active",
    "createdAt": "2025-07-29T15:06:49.318Z",
    "createdBy": "system"
  }
];

const mockInboundRecords = [
  {
    "_id": "1",
    "product": {
      "_id": "1",
      "name": "可口可乐",
      "brand": "可口可乐",
      "specification": "330ml",
      "unit": "瓶"
    },
    "supplier": {
      "_id": "1",
      "name": "北京食品供应商"
    },
    "quantity": 50,
    "unitPrice": 2.5,
    "totalAmount": 125,
    "inboundDate": "2025-01-15T10:30:00.000Z",
    "inboundType": "purchase",
    "remark": "正常采购入库",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
];

const mockOutboundRecords = [
  {
    "_id": "1",
    "product": {
      "_id": "1",
      "name": "可口可乐",
      "brand": "可口可乐",
      "specification": "330ml",
      "unit": "瓶"
    },
    "quantity": 10,
    "unitPrice": 3.5,
    "totalAmount": 35,
    "outboundDate": "2025-01-16T14:20:00.000Z",
    "outboundType": "sale",
    "remark": "正常销售出库",
    "createdAt": "2025-01-16T14:20:00.000Z"
  }
];

// 健康检查
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: '库存管理系统API运行正常',
    timestamp: new Date().toISOString(),
    environment: 'Tencent Cloud Function'
  });
});

// 商品管理API
app.get('/api/products', async (c) => {
  try {
    const { page = 1, limit = 20, search, category, status } = c.req.query();
    
    let filteredProducts = [...mockProducts];
    
    // 搜索过滤
    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.includes(search) || 
        p.brand.includes(search) ||
        p.category.includes(search)
      );
    }
    
    // 分类过滤
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // 状态过滤
    if (status) {
      filteredProducts = filteredProducts.filter(p => p.status === status);
    }
    
    // 分页
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return c.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        total: filteredProducts.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredProducts.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

app.post('/api/products', async (c) => {
  try {
    const productData = await c.req.json();
    
    // 生成新ID
    const newId = (mockProducts.length + 1).toString();
    const newProduct = {
      _id: newId,
      ...productData,
      currentStock: 0,
      createdAt: new Date().toISOString()
    };
    
    mockProducts.push(newProduct);
    
    return c.json({
      success: true,
      message: '商品创建成功',
      data: newProduct
    }, 201);
  } catch (error) {
    console.error('创建商品失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

app.put('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json();
    
    const productIndex = mockProducts.findIndex(p => p._id === id);
    if (productIndex === -1) {
      return c.json({ success: false, message: '商品不存在' }, 404);
    }
    
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return c.json({
      success: true,
      message: '商品更新成功',
      data: mockProducts[productIndex]
    });
  } catch (error) {
    console.error('更新商品失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

app.delete('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const productIndex = mockProducts.findIndex(p => p._id === id);
    if (productIndex === -1) {
      return c.json({ success: false, message: '商品不存在' }, 404);
    }
    
    mockProducts.splice(productIndex, 1);
    
    return c.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// 供应商管理API
app.get('/api/suppliers', async (c) => {
  try {
    const { page = 1, limit = 20, search, status } = c.req.query();
    
    let filteredSuppliers = [...mockSuppliers];
    
    // 搜索过滤
    if (search) {
      filteredSuppliers = filteredSuppliers.filter(s => 
        s.name.includes(search) || 
        s.contact.includes(search)
      );
    }
    
    // 状态过滤
    if (status) {
      filteredSuppliers = filteredSuppliers.filter(s => s.status === status);
    }
    
    // 分页
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);
    
    return c.json({
      success: true,
      data: paginatedSuppliers,
      pagination: {
        total: filteredSuppliers.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredSuppliers.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取供应商列表失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

app.post('/api/suppliers', async (c) => {
  try {
    const supplierData = await c.req.json();
    
    // 生成新ID
    const newId = (mockSuppliers.length + 1).toString();
    const newSupplier = {
      _id: newId,
      ...supplierData,
      createdAt: new Date().toISOString()
    };
    
    mockSuppliers.push(newSupplier);
    
    return c.json({
      success: true,
      message: '供应商创建成功',
      data: newSupplier
    }, 201);
  } catch (error) {
    console.error('创建供应商失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

app.put('/api/suppliers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json();
    
    const supplierIndex = mockSuppliers.findIndex(s => s._id === id);
    if (supplierIndex === -1) {
      return c.json({ success: false, message: '供应商不存在' }, 404);
    }
    
    mockSuppliers[supplierIndex] = {
      ...mockSuppliers[supplierIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return c.json({
      success: true,
      message: '供应商更新成功',
      data: mockSuppliers[supplierIndex]
    });
  } catch (error) {
    console.error('更新供应商失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

app.delete('/api/suppliers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const supplierIndex = mockSuppliers.findIndex(s => s._id === id);
    if (supplierIndex === -1) {
      return c.json({ success: false, message: '供应商不存在' }, 404);
    }
    
    mockSuppliers.splice(supplierIndex, 1);
    
    return c.json({
      success: true,
      message: '供应商删除成功'
    });
  } catch (error) {
    console.error('删除供应商失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// 根据商品ID获取相关供应商
app.get('/api/suppliers/by-product/:productId', async (c) => {
  try {
    const productId = c.req.param('productId');
    
    // 从入库记录中找到与该商品相关的供应商ID
    const relatedInbounds = mockInboundRecords.filter(record => record.product._id === productId);
    const supplierIds = [...new Set(relatedInbounds.map(record => record.supplier._id))];
    
    // 获取这些供应商的详细信息
    const relatedSuppliers = mockSuppliers.filter(supplier => 
      supplierIds.includes(supplier._id)
    );
    
    return c.json({
      success: true,
      data: relatedSuppliers
    });
  } catch (error) {
    console.error('获取相关供应商失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// 入库管理API
app.get('/api/inbound', async (c) => {
  try {
    const { page = 1, limit = 20, search, productName, dateRange } = c.req.query();
    
    let filteredRecords = [...mockInboundRecords];
    
    // 搜索过滤
    if (search) {
      filteredRecords = filteredRecords.filter(r => 
        r.product.name.includes(search) || 
        r.supplier.name.includes(search)
      );
    }
    
    // 商品名称过滤
    if (productName) {
      filteredRecords = filteredRecords.filter(r => r.product.name.includes(productName));
    }
    
    // 分页
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
    
    return c.json({
      success: true,
      data: paginatedRecords,
      pagination: {
        total: filteredRecords.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredRecords.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取入库记录失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

app.post('/api/inbound', async (c) => {
  try {
    const inboundData = await c.req.json();
    
    // 查找商品信息
    const product = mockProducts.find(p => p._id === inboundData.productId);
    if (!product) {
      return c.json({ success: false, message: '商品不存在' }, 404);
    }
    
    // 查找供应商信息
    const supplier = mockSuppliers.find(s => s._id === inboundData.supplierId);
    if (!supplier) {
      return c.json({ success: false, message: '供应商不存在' }, 404);
    }
    
    // 生成新的入库记录
    const newRecord = {
      _id: (mockInboundRecords.length + 1).toString(),
      product: {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        specification: product.specification,
        unit: product.unit
      },
      supplier: {
        _id: supplier._id,
        name: supplier.name
      },
      quantity: inboundData.quantity,
      unitPrice: inboundData.unitPrice,
      totalAmount: inboundData.quantity * inboundData.unitPrice,
      inboundDate: inboundData.inboundDate || new Date().toISOString(),
      inboundType: inboundData.inboundType || 'purchase',
      remark: inboundData.remark || '',
      createdAt: new Date().toISOString()
    };
    
    mockInboundRecords.push(newRecord);
    
    // 更新商品库存
    const productIndex = mockProducts.findIndex(p => p._id === inboundData.productId);
    if (productIndex !== -1) {
      mockProducts[productIndex].currentStock += inboundData.quantity;
    }
    
    return c.json({
      success: true,
      message: '入库记录创建成功',
      data: newRecord
    }, 201);
  } catch (error) {
    console.error('创建入库记录失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// 出库管理API
app.get('/api/outbound', async (c) => {
  try {
    const { page = 1, limit = 20, search, productName, dateRange } = c.req.query();
    
    let filteredRecords = [...mockOutboundRecords];
    
    // 搜索过滤
    if (search) {
      filteredRecords = filteredRecords.filter(r => 
        r.product.name.includes(search)
      );
    }
    
    // 商品名称过滤
    if (productName) {
      filteredRecords = filteredRecords.filter(r => r.product.name.includes(productName));
    }
    
    // 分页
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
    
    return c.json({
      success: true,
      data: paginatedRecords,
      pagination: {
        total: filteredRecords.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredRecords.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取出库记录失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

app.post('/api/outbound', async (c) => {
  try {
    const outboundData = await c.req.json();
    
    // 查找商品信息
    const product = mockProducts.find(p => p._id === outboundData.productId);
    if (!product) {
      return c.json({ success: false, message: '商品不存在' }, 404);
    }
    
    // 检查库存是否足够
    if (product.currentStock < outboundData.quantity) {
      return c.json({ 
        success: false, 
        message: `库存不足，当前库存：${product.currentStock}，需要出库：${outboundData.quantity}` 
      }, 400);
    }
    
    // 生成新的出库记录
    const newRecord = {
      _id: (mockOutboundRecords.length + 1).toString(),
      product: {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        specification: product.specification,
        unit: product.unit
      },
      quantity: outboundData.quantity,
      unitPrice: outboundData.unitPrice,
      totalAmount: outboundData.quantity * outboundData.unitPrice,
      outboundDate: outboundData.outboundDate || new Date().toISOString(),
      outboundType: outboundData.outboundType || 'sale',
      remark: outboundData.remark || '',
      createdAt: new Date().toISOString()
    };
    
    mockOutboundRecords.push(newRecord);
    
    // 更新商品库存
    const productIndex = mockProducts.findIndex(p => p._id === outboundData.productId);
    if (productIndex !== -1) {
      mockProducts[productIndex].currentStock -= outboundData.quantity;
    }
    
    return c.json({
      success: true,
      message: '出库记录创建成功',
      data: newRecord
    }, 201);
  } catch (error) {
    console.error('创建出库记录失败:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// 腾讯云函数入口
exports.main_handler = async (event, context) => {
  try {
    // 构造请求对象
    const url = new URL(event.path || '/', 'http://localhost');
    if (event.queryString) {
      Object.entries(event.queryString).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    const request = new Request(url.toString(), {
      method: event.httpMethod || 'GET',
      headers: event.headers || {},
      body: event.body || undefined
    });
    
    // 处理请求
    const response = await app.fetch(request);
    
    // 返回响应
    const responseBody = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: responseBody
    };
  } catch (error) {
    console.error('函数执行错误:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: '服务器内部错误',
        error: error.message
      })
    };
  }
};

module.exports = app;