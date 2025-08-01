import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

// 创建简单的测试应用
const app = new Hono();

// 配置CORS - 允许所有来源
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 添加请求日志
app.use('*', async (c, next) => {
  console.log(`${new Date().toISOString()} - ${c.req.method} ${c.req.url}`);
  await next();
});

// 模拟商品数据
const mockProducts = [
  {
    _id: '1',
    name: '可口可乐',
    brand: '可口可乐',
    category: '饮料',
    specification: '500ml',
    purchasePrice: 2.50,
    inputPrice: 3.00,
    retailPrice: 3.50,
    currentStock: 120,
    stockAlert: 20,
    unit: '瓶',
    status: 'active',
    barcode: '1234567890123',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    _id: '2',
    name: '薯片',
    brand: '乐事',
    category: '零食',
    specification: '70g',
    purchasePrice: 4.00,
    inputPrice: 5.00,
    retailPrice: 6.00,
    currentStock: 80,
    stockAlert: 15,
    unit: '包',
    status: 'active',
    barcode: '2345678901234',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    _id: '3',
    name: '洗发水',
    brand: '海飞丝',
    category: '日用品',
    specification: '400ml',
    purchasePrice: 15.00,
    inputPrice: 18.00,
    retailPrice: 22.00,
    currentStock: 5,
    stockAlert: 10,
    unit: '瓶',
    status: 'active',
    barcode: '3456789012345',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    _id: '4',
    name: '中华烟',
    brand: '中华',
    category: '烟酒',
    specification: '20支装',
    purchasePrice: 45.00,
    inputPrice: 50.00,
    retailPrice: 55.00,
    currentStock: 30,
    stockAlert: 5,
    unit: '包',
    status: 'active',
    barcode: '4567890123456',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    _id: '5',
    name: '矿泉水',
    brand: '农夫山泉',
    category: '饮料',
    specification: '550ml',
    purchasePrice: 1.50,
    inputPrice: 2.00,
    retailPrice: 2.50,
    currentStock: 200,
    stockAlert: 50,
    unit: '瓶',
    status: 'active',
    barcode: '5678901234567',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

// 健康检查
app.get('/health', (c) => {
  return c.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: '本地测试服务器',
    message: '服务运行正常'
  });
});

// 模拟仪表板数据
app.get('/api/reports/dashboard', (c) => {
  // 计算商品分类统计
  const categoryStats = mockProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  // 计算品牌分布统计
  const brandStats = mockProducts.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {});

  // 转换为图表需要的格式
  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));
  const brandData = Object.entries(brandStats).map(([name, value]) => ({ name, value }));

  return c.json({
    success: true,
    data: {
      totalProducts: mockProducts.length,
      totalSuppliers: 25,
      lowStockProducts: mockProducts.filter(p => p.currentStock <= p.stockAlert).length,
      todayInbound: 12,
      todayOutbound: 18,
      categoryStats: categoryData,
      brandStats: brandData
    }
  });
});

// 模拟供应商数据
const mockSuppliers = [
  { 
    _id: '1', 
    name: '北京食品供应商', 
    contact: '张三', 
    phone: '13800138001',
    products: ['可口可乐', '雪碧', '芬达'],
    paymentMethod: '银行转账',
    hasInvoice: true,
    address: '北京市朝阳区xxx路xxx号',
    remark: '主要供应饮料类商品',
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString()
  },
  { 
    _id: '2', 
    name: '上海日用品批发', 
    contact: '李四', 
    phone: '13800138002',
    products: ['洗发水', '沐浴露'],
    paymentMethod: '现金',
    hasInvoice: false,
    address: '上海市浦东新区xxx路xxx号',
    remark: '日用品批发商',
    status: 'active',
    createdAt: new Date('2024-01-15').toISOString()
  },
  { 
    _id: '3', 
    name: '广州零食供应商', 
    contact: '王五', 
    phone: '13800138003',
    products: ['薯片', '饼干', '糖果'],
    paymentMethod: '月结',
    hasInvoice: true,
    address: '广州市天河区xxx路xxx号',
    remark: '专业零食供应商',
    status: 'active',
    createdAt: new Date('2024-02-01').toISOString()
  }
];

app.get('/api/suppliers', (c) => {
  const { page = 1, limit = 20, search = '', status = '' } = c.req.query();
  
  let filteredSuppliers = [...mockSuppliers];
  
  // 应用搜索条件
  if (search) {
    filteredSuppliers = filteredSuppliers.filter(s => s.name.includes(search));
  }
  if (status) {
    filteredSuppliers = filteredSuppliers.filter(s => s.status === status);
  }
  
  const total = filteredSuppliers.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const suppliers = filteredSuppliers.slice(startIndex, endIndex);
  
  return c.json({
    success: true,
    data: suppliers,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

// 创建供应商API
app.post('/api/suppliers', async (c) => {
  try {
    const body = await c.req.json();
    const newSupplier = {
      _id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockSuppliers.push(newSupplier);
    
    return c.json({
      success: true,
      message: '供应商创建成功',
      data: newSupplier
    });
  } catch (error) {
    return c.json({
      success: false,
      message: '创建供应商失败: ' + error.message
    }, 400);
  }
});

// 更新供应商API
app.put('/api/suppliers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const supplierIndex = mockSuppliers.findIndex(s => s._id === id);
    if (supplierIndex === -1) {
      return c.json({
        success: false,
        message: '供应商不存在'
      }, 404);
    }
    
    mockSuppliers[supplierIndex] = {
      ...mockSuppliers[supplierIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    return c.json({
      success: true,
      message: '供应商更新成功',
      data: mockSuppliers[supplierIndex]
    });
  } catch (error) {
    return c.json({
      success: false,
      message: '更新供应商失败: ' + error.message
    }, 400);
  }
});

// 删除供应商API
app.delete('/api/suppliers/:id', (c) => {
  const id = c.req.param('id');
  const supplierIndex = mockSuppliers.findIndex(s => s._id === id);
  
  if (supplierIndex === -1) {
    return c.json({
      success: false,
      message: '供应商不存在'
    }, 404);
  }
  
  mockSuppliers.splice(supplierIndex, 1);
  
  return c.json({
    success: true,
    message: '供应商删除成功'
  });
});

// 获取单个供应商API
app.get('/api/suppliers/:id', (c) => {
  const id = c.req.param('id');
  const supplier = mockSuppliers.find(s => s._id === id);
  
  if (!supplier) {
    return c.json({
      success: false,
      message: '供应商不存在'
    }, 404);
  }
  
  return c.json({
    success: true,
    data: supplier
  });
});

// 根据商品ID获取相关供应商
app.get('/api/suppliers/by-product/:productId', (c) => {
  const productId = c.req.param('productId');
  
  // 从入库记录中查找与该商品有关联的供应商ID
  const relatedSupplierIds = mockInboundRecords
    .filter(record => record.productId._id === productId)
    .map(record => record.supplierId._id);
  
  // 去重
  const uniqueSupplierIds = [...new Set(relatedSupplierIds)];
  
  if (uniqueSupplierIds.length === 0) {
    return c.json({
      success: true,
      data: [],
      message: '该商品暂无供应商记录'
    });
  }
  
  // 获取这些供应商的详细信息
  const suppliers = mockSuppliers.filter(supplier => 
    uniqueSupplierIds.includes(supplier._id) && supplier.status === 'active'
  );
  
  return c.json({
    success: true,
    data: suppliers,
    message: `找到 ${suppliers.length} 个相关供应商`
  });
});

// 模拟入库数据
const mockInboundRecords = [
  { 
    _id: '1', 
    inboundNumber: 'IN20240101001',
    productId: { 
      _id: '1',
      name: '可口可乐',
      brand: '可口可乐',
      specification: '500ml',
      unit: '瓶'
    },
    supplierId: {
      _id: '1',
      name: '北京食品供应商'
    },
    quantity: 100,
    unitPrice: 2.50,
    totalAmount: 250.00,
    inboundDate: new Date('2024-01-01').toISOString(),
    operator: '张三',
    notes: '新年首批进货',
    createdBy: '张三',
    createdAt: new Date('2024-01-01').toISOString()
  },
  { 
    _id: '2', 
    inboundNumber: 'IN20240102001',
    productId: { 
      _id: '2',
      name: '薯片',
      brand: '乐事',
      specification: '70g',
      unit: '包'
    },
    supplierId: {
      _id: '3',
      name: '广州零食供应商'
    },
    quantity: 80,
    unitPrice: 4.00,
    totalAmount: 320.00,
    inboundDate: new Date('2024-01-02').toISOString(),
    operator: '李四',
    notes: '补充库存',
    createdBy: '李四',
    createdAt: new Date('2024-01-02').toISOString()
  }
];

app.get('/api/inbound', (c) => {
  const { page = 1, limit = 20, productName = '', dateRange = [] } = c.req.query();
  
  let filteredRecords = [...mockInboundRecords];
  
  // 应用搜索条件
  if (productName) {
    filteredRecords = filteredRecords.filter(r => r.productId.name.includes(productName));
  }
  
  const total = filteredRecords.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const records = filteredRecords.slice(startIndex, endIndex);
  
  return c.json({
    success: true,
    data: records,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

// 创建入库记录API
app.post('/api/inbound', async (c) => {
  try {
    const body = await c.req.json();
    
    // 查找商品和供应商信息
    const product = mockProducts.find(p => p._id === body.product);
    const supplier = mockSuppliers.find(s => s._id === body.supplier);
    
    if (!product) {
      return c.json({
        success: false,
        message: '商品不存在'
      }, 400);
    }
    
    if (!supplier) {
      return c.json({
        success: false,
        message: '供应商不存在'
      }, 400);
    }
    
    const newRecord = {
      _id: Date.now().toString(),
      inboundNumber: `IN${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(mockInboundRecords.length + 1).padStart(3, '0')}`,
      productId: {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        specification: product.specification,
        unit: product.unit
      },
      supplierId: {
        _id: supplier._id,
        name: supplier.name
      },
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      totalAmount: body.quantity * body.unitPrice,
      inboundDate: body.inboundDate,
      operator: '系统用户',
      notes: body.notes || '',
      createdBy: '系统用户',
      createdAt: new Date().toISOString()
    };
    
    mockInboundRecords.push(newRecord);
    
    // 更新商品库存
    product.currentStock += body.quantity;
    
    return c.json({
      success: true,
      message: '入库记录创建成功',
      data: newRecord
    });
  } catch (error) {
    return c.json({
      success: false,
      message: '创建入库记录失败: ' + error.message
    }, 400);
  }
});

// 模拟出库数据
const mockOutboundRecords = [
  { 
    _id: '1', 
    outboundNumber: 'OUT20240101001',
    product: { 
      _id: '1',
      name: '可口可乐',
      brand: '可口可乐',
      specification: '500ml',
      unit: '瓶'
    },
    quantity: 50,
    unitPrice: 3.00,
    totalAmount: 150.00,
    outboundType: 'sale',
    outboundDate: new Date('2024-01-01').toISOString(),
    operator: '王五',
    remark: '销售出库',
    createdBy: '王五',
    createdAt: new Date('2024-01-01').toISOString()
  },
  { 
    _id: '2', 
    outboundNumber: 'OUT20240102001',
    product: { 
      _id: '2',
      name: '薯片',
      brand: '乐事',
      specification: '70g',
      unit: '包'
    },
    quantity: 20,
    unitPrice: 6.00,
    totalAmount: 120.00,
    outboundType: 'sale',
    outboundDate: new Date('2024-01-02').toISOString(),
    operator: '李四',
    remark: '销售出库',
    createdBy: '李四',
    createdAt: new Date('2024-01-02').toISOString()
  }
];

app.get('/api/outbound', (c) => {
  const { page = 1, limit = 20, productName = '', dateRange = [] } = c.req.query();
  
  let filteredRecords = [...mockOutboundRecords];
  
  // 应用搜索条件
  if (productName) {
    filteredRecords = filteredRecords.filter(r => r.product.name.includes(productName));
  }
  
  const total = filteredRecords.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const records = filteredRecords.slice(startIndex, endIndex);
  
  return c.json({
    success: true,
    data: records,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

// 创建出库记录API
app.post('/api/outbound', async (c) => {
  try {
    const body = await c.req.json();
    
    // 查找商品信息
    const product = mockProducts.find(p => p._id === body.product);
    
    if (!product) {
      return c.json({
        success: false,
        message: '商品不存在'
      }, 400);
    }
    
    if (product.currentStock < body.quantity) {
      return c.json({
        success: false,
        message: '库存不足'
      }, 400);
    }
    
    const newRecord = {
      _id: Date.now().toString(),
      outboundNumber: `OUT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(mockOutboundRecords.length + 1).padStart(3, '0')}`,
      product: {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        specification: product.specification,
        unit: product.unit
      },
      quantity: body.quantity,
      unitPrice: body.unitPrice || product.retailPrice,
      totalAmount: body.quantity * (body.unitPrice || product.retailPrice),
      outboundType: body.outboundType || 'sale',
      outboundDate: body.outboundDate,
      operator: '系统用户',
      remark: body.remark || '',
      createdBy: '系统用户',
      createdAt: new Date().toISOString()
    };
    
    mockOutboundRecords.push(newRecord);
    
    // 更新商品库存
    product.currentStock -= body.quantity;
    
    return c.json({
      success: true,
      message: '出库记录创建成功',
      data: newRecord
    });
  } catch (error) {
    return c.json({
      success: false,
      message: '创建出库记录失败: ' + error.message
    }, 400);
  }
});

// 商品列表API
app.get('/api/products', (c) => {
  const { page = 1, limit = 20, name = '', brand = '', category = '', status = '' } = c.req.query();
  
  let filteredProducts = [...mockProducts];
  
  // 应用筛选条件
  if (name) {
    filteredProducts = filteredProducts.filter(p => p.name.includes(name));
  }
  if (brand) {
    filteredProducts = filteredProducts.filter(p => p.brand.includes(brand));
  }
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  if (status) {
    filteredProducts = filteredProducts.filter(p => p.status === status);
  }
  
  const total = filteredProducts.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const products = filteredProducts.slice(startIndex, endIndex);
  
  return c.json({
    success: true,
    data: products,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// 创建商品API
app.post('/api/products', async (c) => {
  try {
    const body = await c.req.json();
    const newProduct = {
      _id: Date.now().toString(),
      ...body,
      currentStock: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockProducts.push(newProduct);
    
    return c.json({
      success: true,
      message: '商品创建成功',
      data: newProduct
    });
  } catch (error) {
    return c.json({
      success: false,
      message: '创建商品失败: ' + error.message
    }, 400);
  }
});

// 更新商品API
app.put('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const productIndex = mockProducts.findIndex(p => p._id === id);
    if (productIndex === -1) {
      return c.json({
        success: false,
        message: '商品不存在'
      }, 404);
    }
    
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    return c.json({
      success: true,
      message: '商品更新成功',
      data: mockProducts[productIndex]
    });
  } catch (error) {
    return c.json({
      success: false,
      message: '更新商品失败: ' + error.message
    }, 400);
  }
});

// 删除商品API
app.delete('/api/products/:id', (c) => {
  const id = c.req.param('id');
  const productIndex = mockProducts.findIndex(p => p._id === id);
  
  if (productIndex === -1) {
    return c.json({
      success: false,
      message: '商品不存在'
    }, 404);
  }
  
  mockProducts.splice(productIndex, 1);
  
  return c.json({
    success: true,
    message: '商品删除成功'
  });
});

// 获取单个商品API
app.get('/api/products/:id', (c) => {
  const id = c.req.param('id');
  const product = mockProducts.find(p => p._id === id);
  
  if (!product) {
    return c.json({
      success: false,
      message: '商品不存在'
    }, 404);
  }
  
  return c.json({
    success: true,
    data: product
  });
});

// 404处理
app.notFound((c) => {
  return c.json({ message: '接口不存在' }, 404);
});

// 启动服务器
const port = 3001;
console.log(`🚀 本地测试服务器启动在 http://localhost:${port}`);
console.log(`📊 测试仪表板API: http://localhost:${port}/api/reports/dashboard`);
console.log(`🏥 健康检查: http://localhost:${port}/health`);

serve({
  fetch: app.fetch,
  port
});