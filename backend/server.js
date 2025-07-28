const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// 安全中间件
app.use(helmet());

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use(limiter);

// CORS配置
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// 数据库连接配置
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // 连接池最大连接数
  serverSelectionTimeoutMS: 5000, // 服务器选择超时
  socketTimeoutMS: 45000, // Socket超时
};

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/convenience_store', mongoOptions)
.then(() => {
  console.log('MongoDB 连接成功');
})
.catch(err => {
  console.error('MongoDB 连接失败:', err);
  process.exit(1); // 连接失败时退出进程
});

// MongoDB连接事件监听
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB 连接断开');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB 重新连接成功');
});

// 优雅关闭
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB 连接已关闭');
    process.exit(0);
  } catch (err) {
    console.error('关闭MongoDB连接时出错:', err);
    process.exit(1);
  }
});

// 路由
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/suppliers', require('./src/routes/suppliers'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/inbound', require('./src/routes/inbound'));
app.use('/api/outbound', require('./src/routes/outbound'));
app.use('/api/reports', require('./src/routes/reports'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404处理
app.use('*', (req, res) => {
  console.warn(`404 - 接口不存在: ${req.method} ${req.url}`);
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('=== 服务器错误 ===');
  console.error('时间:', new Date().toISOString());
  console.error('请求:', req.method, req.url);
  console.error('错误:', err.message);
  console.error('堆栈:', err.stack);
  console.error('==================');
  
  // 检查是否是MongoDB相关错误
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    console.error('MongoDB错误详情:', err);
    return res.status(503).json({ 
      message: '数据库服务暂时不可用',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
  
  // 检查是否是验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: '数据验证失败',
      errors: err.errors,
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
  
  // 检查是否是类型转换错误
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: '无效的数据格式',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
  
  res.status(500).json({ 
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});