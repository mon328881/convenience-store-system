// 腾讯云函数专用版本 - 修复错误145
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

// 原始数据备份，用于重置
const originalMockSuppliers = [
  {
    "_id": "1",
    "name": "北京食品供应商",
    "contact": "张三",
    "phone": "13800138001",
    "products": ["可口可乐", "雪碧", "芬达", "矿泉水"],
    "paymentMethod": "银行转账",
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
    "products": ["薯片", "饼干", "糖果", "巧克力"],
    "paymentMethod": "月结",
    "hasInvoice": false,
    "address": "上海市浦东新区xxx路xxx号",
    "remark": "零食类商品供应商",
    "status": "active",
    "createdAt": "2025-07-29T15:06:49.318Z",
    "createdBy": "system"
  },
  {
    "_id": "3",
    "name": "广州日用品供应商",
    "contact": "王五",
    "phone": "13800138003",
    "products": ["洗发水", "沐浴露", "牙膏", "洗衣液"],
    "paymentMethod": "现金",
    "hasInvoice": true,
    "address": "广州市天河区xxx路xxx号",
    "remark": "日用品专业供应商",
    "status": "active",
    "createdAt": "2025-07-29T15:06:49.318Z",
    "createdBy": "system"
  }
];

const mockSuppliers = JSON.parse(JSON.stringify(originalMockSuppliers));

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
  },
  {
    "_id": "2",
    "product": {
      "_id": "2",
      "name": "雪碧",
      "brand": "可口可乐",
      "specification": "330ml",
      "unit": "瓶"
    },
    "supplier": {
      "_id": "1",
      "name": "北京食品供应商"
    },
    "quantity": 30,
    "unitPrice": 2.5,
    "totalAmount": 75,
    "inboundDate": "2025-01-16T10:30:00.000Z",
    "inboundType": "purchase",
    "remark": "补充库存",
    "createdAt": "2025-01-16T10:30:00.000Z"
  },
  {
    "_id": "3",
    "product": {
      "_id": "3",
      "name": "薯片",
      "brand": "乐事",
      "specification": "70g",
      "unit": "包"
    },
    "supplier": {
      "_id": "2",
      "name": "上海零食批发商"
    },
    "quantity": 40,
    "unitPrice": 4.0,
    "totalAmount": 160,
    "inboundDate": "2025-01-17T10:30:00.000Z",
    "inboundType": "purchase",
    "remark": "新品入库",
    "createdAt": "2025-01-17T10:30:00.000Z"
  },
  {
    "_id": "4",
    "product": {
      "_id": "4",
      "name": "饼干",
      "brand": "奥利奥",
      "specification": "100g",
      "unit": "包"
    },
    "supplier": {
      "_id": "2",
      "name": "上海零食批发商"
    },
    "quantity": 25,
    "unitPrice": 5.5,
    "totalAmount": 137.5,
    "inboundDate": "2025-01-18T10:30:00.000Z",
    "inboundType": "purchase",
    "remark": "热销商品补货",
    "createdAt": "2025-01-18T10:30:00.000Z"
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

// 解析查询参数
function parseQueryString(queryString) {
  const params = {};
  if (!queryString) return params;
  
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
    }
  }
  return params;
}

// 路由处理函数
const handleRequest = async (method, path, queryString, body, headers) => {
  const query = parseQueryString(queryString);
  
  // 设置CORS头
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // 处理OPTIONS请求
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // 数据重置API（仅用于测试）
    if (path === '/api/reset-data' && method === 'POST') {
      // 重置供应商数据到原始状态
      mockSuppliers.length = 0;
      mockSuppliers.push(...JSON.parse(JSON.stringify(originalMockSuppliers)));
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: '数据已重置到原始状态'
        })
      };
    }
    // 健康检查
    if (path === '/api/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: '库存管理系统API运行正常',
          timestamp: new Date().toISOString(),
          environment: 'Tencent Cloud Function'
        })
      };
    }

    // 商品管理API
    if (path === '/api/products' && method === 'GET') {
      const { page = 1, limit = 20, search, category, status } = query;
      
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
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: paginatedProducts,
          pagination: {
            total: filteredProducts.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(filteredProducts.length / parseInt(limit))
          }
        })
      };
    }

    if (path === '/api/products' && method === 'POST') {
      const productData = JSON.parse(body);
      
      // 生成新ID
      const newId = (mockProducts.length + 1).toString();
      const newProduct = {
        _id: newId,
        ...productData,
        currentStock: 0,
        createdAt: new Date().toISOString()
      };
      
      mockProducts.push(newProduct);
      
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: '商品创建成功',
          data: newProduct
        })
      };
    }

    // 处理商品更新和删除
    const productIdMatch = path.match(/^\/api\/products\/(.+)$/);
    if (productIdMatch) {
      const id = productIdMatch[1];
      
      if (method === 'PUT') {
        const updateData = JSON.parse(body);
        const productIndex = mockProducts.findIndex(p => p._id === id);
        
        if (productIndex === -1) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, message: '商品不存在' })
          };
        }
        
        mockProducts[productIndex] = {
          ...mockProducts[productIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: '商品更新成功',
            data: mockProducts[productIndex]
          })
        };
      }
      
      if (method === 'DELETE') {
        const productIndex = mockProducts.findIndex(p => p._id === id);
        
        if (productIndex === -1) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, message: '商品不存在' })
          };
        }
        
        mockProducts.splice(productIndex, 1);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: '商品删除成功'
          })
        };
      }
    }

    // 供应商管理API
    if (path === '/api/suppliers' && method === 'GET') {
      const { page = 1, limit = 20, search, status } = query;
      
      // 使用深拷贝确保原始数据不被修改
      let filteredSuppliers = JSON.parse(JSON.stringify(mockSuppliers));
      
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
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: paginatedSuppliers,
          pagination: {
            total: filteredSuppliers.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(filteredSuppliers.length / parseInt(limit))
          }
        })
      };
    }

    if (path === '/api/suppliers' && method === 'POST') {
      const supplierData = JSON.parse(body);
      
      // 生成新ID
      const newId = (mockSuppliers.length + 1).toString();
      const newSupplier = {
        _id: newId,
        ...supplierData,
        createdAt: new Date().toISOString()
      };
      
      mockSuppliers.push(newSupplier);
      
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: '供应商创建成功',
          data: newSupplier
        })
      };
    }

    // 处理供应商更新和删除
    const supplierIdMatch = path.match(/^\/api\/suppliers\/(.+)$/);
    if (supplierIdMatch) {
      const id = supplierIdMatch[1];
      
      if (method === 'PUT') {
        const updateData = JSON.parse(body);
        const supplierIndex = mockSuppliers.findIndex(s => s._id === id);
        
        if (supplierIndex === -1) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, message: '供应商不存在' })
          };
        }
        
        // 确保不会丢失重要字段，特别是products字段
        const updatedSupplier = {
          ...mockSuppliers[supplierIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        
        // 如果updateData中没有products字段，保留原有的products
        if (!updateData.hasOwnProperty('products')) {
          updatedSupplier.products = mockSuppliers[supplierIndex].products;
        }
        
        mockSuppliers[supplierIndex] = updatedSupplier;
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: '供应商更新成功',
            data: mockSuppliers[supplierIndex]
          })
        };
      }
      
      if (method === 'DELETE') {
        const supplierIndex = mockSuppliers.findIndex(s => s._id === id);
        
        if (supplierIndex === -1) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, message: '供应商不存在' })
          };
        }
        
        mockSuppliers.splice(supplierIndex, 1);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: '供应商删除成功'
          })
        };
      }
    }



    // 入库管理API
    if (path === '/api/inbound' && method === 'GET') {
      const { page = 1, limit = 20, search, productName } = query;
      
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
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: paginatedRecords,
          pagination: {
            total: filteredRecords.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(filteredRecords.length / parseInt(limit))
          }
        })
      };
    }

    if (path === '/api/inbound' && method === 'POST') {
      const inboundData = JSON.parse(body);
      
      // 查找商品信息
      const product = mockProducts.find(p => p._id === inboundData.productId);
      if (!product) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ success: false, message: '商品不存在' })
        };
      }
      
      // 查找供应商信息
      const supplier = mockSuppliers.find(s => s._id === inboundData.supplierId);
      if (!supplier) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ success: false, message: '供应商不存在' })
        };
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
      
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: '入库记录创建成功',
          data: newRecord
        })
      };
    }

    // 出库管理API
    if (path === '/api/outbound' && method === 'GET') {
      const { page = 1, limit = 20, search, productName } = query;
      
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
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: paginatedRecords,
          pagination: {
            total: filteredRecords.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(filteredRecords.length / parseInt(limit))
          }
        })
      };
    }

    if (path === '/api/outbound' && method === 'POST') {
      const outboundData = JSON.parse(body);
      
      // 查找商品信息
      const product = mockProducts.find(p => p._id === outboundData.productId);
      if (!product) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ success: false, message: '商品不存在' })
        };
      }
      
      // 检查库存是否足够
      if (product.currentStock < outboundData.quantity) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ 
            success: false, 
            message: `库存不足，当前库存：${product.currentStock}，需要出库：${outboundData.quantity}` 
          })
        };
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
      
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: '出库记录创建成功',
          data: newRecord
        })
      };
    }

    // 404 处理
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        message: 'API端点未找到'
      })
    };

  } catch (error) {
    console.error('API处理错误:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        message: '服务器内部错误',
        error: error.message
      })
    };
  }
};

// 腾讯云函数入口
exports.main_handler = async (event, context) => {
  try {
    console.log('收到请求:', JSON.stringify(event, null, 2));
    
    const method = event.httpMethod || 'GET';
    const path = event.path || '/';
    const queryString = event.queryStringParameters ? 
      Object.entries(event.queryStringParameters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&') : '';
    const body = event.body || '';
    const headers = event.headers || {};
    
    const result = await handleRequest(method, path, queryString, body, headers);
    
    console.log('返回结果:', JSON.stringify(result, null, 2));
    return result;
    
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