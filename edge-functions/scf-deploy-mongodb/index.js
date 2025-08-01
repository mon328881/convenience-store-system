// 腾讯云函数 - MongoDB版本
const mongoose = require('mongoose');

// MongoDB连接状态
let isConnected = false;

// 数据模型定义
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contact: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  products: [{ type: String, trim: true }],
  paymentMethod: { type: String, required: true, enum: ['现金', '转账', '月结', '其他'] },
  hasInvoice: { type: Boolean, default: false },
  address: { type: String, trim: true },
  remark: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  specification: { type: String, trim: true },
  purchasePrice: { type: Number, required: true, min: 0 },
  inputPrice: { type: Number, required: true, min: 0 },
  retailPrice: { type: Number, required: true, min: 0 },
  currentStock: { type: Number, default: 0, min: 0 },
  stockAlert: { type: Number, default: 10, min: 0 },
  unit: { type: String, required: true, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  barcode: { type: String, trim: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });

const inboundSchema = new mongoose.Schema({
  product: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    specification: { type: String },
    unit: { type: String, required: true }
  },
  supplier: {
    _id: { type: String, required: true },
    name: { type: String, required: true }
  },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  inboundDate: { type: Date, required: true },
  inboundType: { type: String, enum: ['purchase', 'return', 'transfer', 'other'], default: 'purchase' },
  remark: { type: String, trim: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });

const outboundSchema = new mongoose.Schema({
  product: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    specification: { type: String },
    unit: { type: String, required: true }
  },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  outboundDate: { type: Date, required: true },
  outboundType: { type: String, enum: ['sale', 'damage', 'transfer', 'other'], default: 'sale' },
  remark: { type: String, trim: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });

// 创建模型
let Supplier, Product, Inbound, Outbound;

// MongoDB连接函数
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI环境变量未设置');
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });

    isConnected = true;
    
    // 创建模型
    Supplier = mongoose.model('Supplier', supplierSchema);
    Product = mongoose.model('Product', productSchema);
    Inbound = mongoose.model('Inbound', inboundSchema);
    Outbound = mongoose.model('Outbound', outboundSchema);

    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    isConnected = false;
    throw error;
  }
};

// 初始化数据函数
const initializeData = async () => {
  try {
    // 检查是否已有数据
    const supplierCount = await Supplier.countDocuments();
    const productCount = await Product.countDocuments();

    if (supplierCount === 0) {
      // 初始化供应商数据
      const initialSuppliers = [
        {
          name: "北京食品供应商",
          contact: "张三",
          phone: "13800138001",
          products: ["可口可乐", "雪碧", "芬达", "矿泉水"],
          paymentMethod: "转账",
          hasInvoice: true,
          address: "北京市朝阳区xxx路xxx号",
          remark: "主要供应饮料类商品",
          status: "active",
          createdBy: "system"
        },
        {
          name: "上海零食批发商",
          contact: "李四",
          phone: "13900139002",
          products: ["薯片", "饼干", "糖果", "巧克力"],
          paymentMethod: "月结",
          hasInvoice: false,
          address: "上海市浦东新区xxx路xxx号",
          remark: "零食类商品供应商",
          status: "active",
          createdBy: "system"
        },
        {
          name: "广州日用品供应商",
          contact: "王五",
          phone: "13800138003",
          products: ["洗发水", "沐浴露", "牙膏", "洗衣液"],
          paymentMethod: "现金",
          hasInvoice: true,
          address: "广州市天河区xxx路xxx号",
          remark: "日用品专业供应商",
          status: "active",
          createdBy: "system"
        }
      ];

      await Supplier.insertMany(initialSuppliers);
      console.log('初始化供应商数据完成');
    }

    if (productCount === 0) {
      // 初始化商品数据
      const initialProducts = [
        {
          name: "可口可乐",
          brand: "可口可乐",
          category: "饮料",
          specification: "330ml",
          purchasePrice: 2.5,
          inputPrice: 3,
          retailPrice: 3.5,
          currentStock: 120,
          stockAlert: 20,
          unit: "瓶",
          status: "active",
          barcode: "1234567890123",
          createdBy: "system"
        },
        {
          name: "薯片",
          brand: "乐事",
          category: "零食",
          specification: "70g",
          purchasePrice: 4,
          inputPrice: 5,
          retailPrice: 6,
          currentStock: 80,
          stockAlert: 15,
          unit: "包",
          status: "active",
          barcode: "2345678901234",
          createdBy: "system"
        },
        {
          name: "洗发水",
          brand: "海飞丝",
          category: "日用品",
          specification: "400ml",
          purchasePrice: 15,
          inputPrice: 18,
          retailPrice: 22,
          currentStock: 5,
          stockAlert: 10,
          unit: "瓶",
          status: "active",
          barcode: "3456789012345",
          createdBy: "system"
        },
        {
          name: "中华烟",
          brand: "中华",
          category: "烟酒",
          specification: "20支装",
          purchasePrice: 45,
          inputPrice: 50,
          retailPrice: 55,
          currentStock: 30,
          stockAlert: 5,
          unit: "包",
          status: "active",
          barcode: "4567890123456",
          createdBy: "system"
        },
        {
          name: "矿泉水",
          brand: "农夫山泉",
          category: "饮料",
          specification: "550ml",
          purchasePrice: 1.5,
          inputPrice: 2,
          retailPrice: 2.5,
          currentStock: 200,
          stockAlert: 50,
          unit: "瓶",
          status: "active",
          barcode: "5678901234567",
          createdBy: "system"
        }
      ];

      await Product.insertMany(initialProducts);
      console.log('初始化商品数据完成');
    }
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
};

// 解析查询字符串
function parseQueryString(queryString) {
  const params = {};
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value !== undefined) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
  }
  return params;
}

// 主处理函数
async function handleRequest(event) {
  try {
    // 连接数据库
    await connectDB();
    
    // 初始化数据（仅在首次运行时）
    await initializeData();

    const { path, httpMethod, queryString, body } = event;
    const query = parseQueryString(queryString);
    let requestBody = {};

    if (body) {
      try {
        requestBody = JSON.parse(body);
      } catch (e) {
        requestBody = {};
      }
    }

    // 健康检查
    if (path === '/api/health' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: '库存管理系统API运行正常',
          timestamp: new Date().toISOString(),
          environment: 'Tencent Cloud Function',
          database: 'MongoDB Atlas'
        })
      };
    }

    // 供应商管理API
    if (path === '/api/suppliers') {
      if (httpMethod === 'GET') {
        const { page = 1, limit = 10, search, status } = query;
        const mongoQuery = {};
        
        // 搜索条件
        if (search) {
          mongoQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { contact: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ];
        }
        
        // 状态筛选
        if (status) {
          mongoQuery.status = status;
        }
        
        const suppliers = await Supplier.find(mongoQuery)
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Supplier.countDocuments(mongoQuery);
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: suppliers,
            pagination: {
              current: parseInt(page),
              pageSize: parseInt(limit),
              total,
              pages: Math.ceil(total / parseInt(limit))
            }
          })
        };
      }

      if (httpMethod === 'POST') {
        // 检查供应商名称是否已存在
        const existingSupplier = await Supplier.findOne({ name: requestBody.name });
        if (existingSupplier) {
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, message: '供应商名称已存在' })
          };
        }

        const supplier = new Supplier({
          ...requestBody,
          createdBy: 'system'
        });

        await supplier.save();
        
        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, data: supplier, message: '供应商创建成功' })
        };
      }
    }

    // 单个供应商操作
    if (path.startsWith('/api/suppliers/') && path !== '/api/suppliers') {
      const supplierId = path.split('/')[3];
      
      if (httpMethod === 'GET') {
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, message: '供应商不存在' })
          };
        }
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, data: supplier })
        };
      }

      if (httpMethod === 'PUT') {
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, message: '供应商不存在' })
          };
        }

        // 如果更新名称，检查是否与其他供应商重复
        if (requestBody.name && requestBody.name !== supplier.name) {
          const existingSupplier = await Supplier.findOne({ 
            name: requestBody.name, 
            _id: { $ne: supplierId } 
          });
          if (existingSupplier) {
            return {
              statusCode: 400,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ success: false, message: '供应商名称已存在' })
            };
          }
        }

        Object.assign(supplier, requestBody, { updatedBy: 'system' });
        await supplier.save();
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, data: supplier, message: '供应商更新成功' })
        };
      }

      if (httpMethod === 'DELETE') {
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, message: '供应商不存在' })
          };
        }

        await Supplier.findByIdAndDelete(supplierId);
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, message: '供应商删除成功' })
        };
      }
    }

    // 商品管理API
    if (path === '/api/products') {
      if (httpMethod === 'GET') {
        const { page = 1, limit = 10, search, category, status } = query;
        const mongoQuery = {};
        
        // 搜索条件
        if (search) {
          mongoQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
            { barcode: { $regex: search, $options: 'i' } }
          ];
        }
        
        // 分类筛选
        if (category) {
          mongoQuery.category = category;
        }
        
        // 状态筛选
        if (status) {
          mongoQuery.status = status;
        }
        
        const products = await Product.find(mongoQuery)
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Product.countDocuments(mongoQuery);
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: products,
            pagination: {
              current: parseInt(page),
              pageSize: parseInt(limit),
              total,
              pages: Math.ceil(total / parseInt(limit))
            }
          })
        };
      }

      if (httpMethod === 'POST') {
        const product = new Product({
          ...requestBody,
          createdBy: 'system'
        });

        await product.save();
        
        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, data: product, message: '商品创建成功' })
        };
      }
    }

    // 404 处理
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'API接口不存在' })
    };

  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        message: '服务器内部错误',
        error: error.message 
      })
    };
  }
}

// 腾讯云函数入口
exports.main_handler = async (event, context) => {
  return await handleRequest(event);
};