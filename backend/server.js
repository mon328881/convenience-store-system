const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 从根目录加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 导入 Supabase 配置
const { supabase } = require('./src/config/supabase');

const app = express();

// 安全中间件
app.use(helmet());

// 限流中间件 - 临时调整为更宽松的配置用于测试
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 200, // 限制每个IP 1分钟内最多200个请求
  message: {
    error: 'Too many requests',
    message: '请求过于频繁，请稍后再试',
    retryAfter: '1 minute'
  }
});
app.use(limiter);

// CORS配置
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
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
  const requestId = Math.random().toString(36).substr(2, 9);
  req.requestId = requestId;
  
  console.log(`[REQ-${requestId}] 收到请求: ${req.method} ${req.originalUrl || req.url}`);
  console.log(`[REQ-${requestId}] IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  console.log(`[REQ-${requestId}] 路径详情: originalUrl=${req.originalUrl}, url=${req.url}, path=${req.path}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[REQ-${requestId}] 响应完成: ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} - ${duration}ms`);
    
    // 如果是500错误，记录更多信息
    if (res.statusCode === 500) {
      console.error(`[REQ-${requestId}] 500错误详情:`);
      console.error(`[REQ-${requestId}] - 请求路径: ${req.originalUrl || req.url}`);
      console.error(`[REQ-${requestId}] - 请求方法: ${req.method}`);
      console.error(`[REQ-${requestId}] - 请求头: ${JSON.stringify(req.headers)}`);
      console.error(`[REQ-${requestId}] - 响应时间: ${duration}ms`);
    }
  });
  next();
});

// Supabase 连接测试
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('suppliers').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase 连接测试失败:', error);
    } else {
      console.log('✅ Supabase 连接成功');
    }
  } catch (err) {
    console.error('Supabase 连接错误:', err);
  }
}

// 测试数据库连接
testSupabaseConnection();

// 根路径处理 - 必须在API路由之前
app.get('/', (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  try {
    console.log(`[ROOT-${requestId}] 开始处理根路径请求`);
    console.log(`[ROOT-${requestId}] IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
    console.log(`[ROOT-${requestId}] 请求头: ${JSON.stringify(req.headers)}`);
    console.log(`[ROOT-${requestId}] 响应状态检查 - headersSent: ${res.headersSent}, finished: ${res.finished}`);
    
    // 检查响应是否已经发送
    if (res.headersSent) {
      console.warn(`[ROOT-${requestId}] 响应已发送，跳过处理`);
      return;
    }
    
    // 检查请求对象状态
    console.log(`[ROOT-${requestId}] 请求对象状态 - method: ${req.method}, url: ${req.url}, complete: ${req.complete}`);
    
    // 检查响应对象状态
    console.log(`[ROOT-${requestId}] 响应对象状态 - statusCode: ${res.statusCode}, writable: ${res.writable}`);
    
    const response = { 
      message: '便利店进销存系统API服务',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      requestId: requestId,
      requestInfo: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.url,
        headers: req.headers
      }
    };
    
    console.log(`[ROOT-${requestId}] 准备发送响应: ${JSON.stringify(response).substring(0, 200)}...`);
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Request-ID', requestId);
    
    console.log(`[ROOT-${requestId}] 响应头设置完成，准备发送JSON`);
    
    res.status(200).json(response);
    
    const duration = Date.now() - startTime;
    console.log(`[ROOT-${requestId}] 成功响应根路径请求，耗时: ${duration}ms`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[ROOT-${requestId}] 根路径处理错误 (耗时: ${duration}ms):`, error);
    console.error(`[ROOT-${requestId}] 错误类型: ${error.constructor.name}`);
    console.error(`[ROOT-${requestId}] 错误消息: ${error.message}`);
    console.error(`[ROOT-${requestId}] 错误堆栈:`, error.stack);
    console.error(`[ROOT-${requestId}] 响应状态 - headersSent: ${res.headersSent}, finished: ${res.finished}`);
    
    // 确保错误响应也能正常发送
    try {
      if (!res.headersSent) {
        console.log(`[ROOT-${requestId}] 发送500错误响应`);
        res.status(500).json({ 
          message: '服务器内部错误',
          error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
          timestamp: new Date().toISOString(),
          requestId: requestId
        });
        console.log(`[ROOT-${requestId}] 500错误响应已发送`);
      } else {
        console.error(`[ROOT-${requestId}] 无法发送错误响应，响应已发送`);
      }
    } catch (responseError) {
      console.error(`[ROOT-${requestId}] 发送错误响应失败:`, responseError);
      console.error(`[ROOT-${requestId}] 响应错误类型: ${responseError.constructor.name}`);
      console.error(`[ROOT-${requestId}] 响应错误消息: ${responseError.message}`);
    }
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API路由
console.log('注册API路由...');
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/suppliers', (req, res, next) => {
  console.log(`[ROUTE-DEBUG] 供应商路由被调用: ${req.method} ${req.url}`);
  next();
}, require('./src/routes/suppliers'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/inbound', require('./src/routes/inbound'));
app.use('/api/outbound', require('./src/routes/outbound'));
app.use('/api/reports', require('./src/routes/reports'));
console.log('API路由注册完成');

// 404处理 - 排除根路径
app.use('*', (req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  // 不处理根路径，避免与根路径处理器冲突
  if (req.path === '/') {
    console.warn(`[404-${requestId}] 根路径请求到达404处理器，这不应该发生`);
    return next();
  }
  
  console.warn(`[404-${requestId}] 接口不存在: ${req.method} ${req.url}`);
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  console.error(`[ERR-${requestId}] === 服务器错误 ===`);
  console.error(`[ERR-${requestId}] 时间:`, new Date().toISOString());
  console.error(`[ERR-${requestId}] 请求:`, req.method, req.url);
  console.error(`[ERR-${requestId}] 错误名称:`, err.name);
  console.error(`[ERR-${requestId}] 错误消息:`, err.message);
  console.error(`[ERR-${requestId}] 错误堆栈:`, err.stack);
  console.error(`[ERR-${requestId}] 请求头:`, JSON.stringify(req.headers));
  console.error(`[ERR-${requestId}] ==================`);
  
  // 检查是否是验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: '数据验证失败',
      errors: err.errors,
      error: process.env.NODE_ENV === 'development' ? err.message : {},
      requestId: requestId
    });
  }
  
  // 检查是否是类型转换错误
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: '无效的数据格式',
      error: process.env.NODE_ENV === 'development' ? err.message : {},
      requestId: requestId
    });
  }
  
  res.status(500).json({ 
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
    requestId: requestId
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});