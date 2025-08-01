# EdgeOne边缘函数部署指南

## 概述

本指南将帮助您将库存管理系统的后端API部署为腾讯云EdgeOne边缘函数，实现完全免费的后端服务。

## 优势

- ✅ **完全免费** - 在免费额度内零成本运行
- ✅ **全球加速** - 边缘节点就近响应
- ✅ **自动扩缩容** - 无需管理服务器
- ✅ **高可用性** - 99.9%+ 可用性保证
- ✅ **国内优化** - 针对中国大陆网络优化

## 前置条件

1. 腾讯云账号（已完成实名认证）
2. MongoDB Atlas数据库（免费版即可）
3. 本地开发环境（Node.js 18+）

## 部署步骤

### 1. 准备边缘函数代码

已为您创建了以下文件：
- `index.js` - 主要的边缘函数代码
- `package.json` - 依赖配置
- `.env.example` - 环境变量示例

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入您的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/inventory?retryWrites=true&w=majority
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
```

### 3. 登录腾讯云EdgeOne控制台

1. 访问 [EdgeOne控制台](https://console.cloud.tencent.com/edgeone)
2. 如果是首次使用，需要开通EdgeOne服务
3. 创建站点或使用现有站点

### 4. 创建边缘函数

1. 在EdgeOne控制台中，选择您的站点
2. 进入"边缘函数"页面
3. 点击"创建函数"
4. 填写函数信息：
   - 函数名称：`inventory-api`
   - 运行时：`JavaScript`
   - 触发器：`HTTP触发器`

### 5. 上传代码

#### 方法一：在线编辑器
1. 将 `index.js` 的内容复制到在线编辑器
2. 配置环境变量（在函数设置中添加）
3. 点击"保存并部署"

#### 方法二：ZIP包上传
1. 将项目文件打包为ZIP：
```bash
cd edge-functions
zip -r inventory-edge-function.zip . -x "node_modules/*" ".env" "*.log"
```
2. 在控制台上传ZIP包
3. 配置环境变量
4. 部署函数

### 6. 配置触发器

1. 在函数详情页面，配置HTTP触发器
2. 设置路径匹配规则：`/api/*`
3. 启用触发器

### 7. 测试部署

获取函数的访问URL，通常格式为：
```
https://your-domain.edgeone.app/api/health
```

测试健康检查接口：
```bash
curl https://your-domain.edgeone.app/api/health
```

预期响应：
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "EdgeOne边缘函数",
  "mongodb": "connected"
}
```

### 8. 更新前端配置

修改前端项目中的API基础URL：

```javascript
// src/config/api.js
const API_BASE_URL = 'https://your-domain.edgeone.app';

export default {
  baseURL: API_BASE_URL,
  timeout: 10000
};
```

### 9. 部署前端到EdgeOne Pages

1. 在EdgeOne控制台中选择"Pages"
2. 连接您的GitHub仓库
3. 配置构建设置：
   - 构建命令：`npm run build`
   - 输出目录：`dist`
4. 部署前端应用

## 性能优化

### 1. 连接池优化

边缘函数已配置了适合的MongoDB连接池：
```javascript
maxPoolSize: 5,
serverSelectionTimeoutMS: 3000,
socketTimeoutMS: 30000
```

### 2. 缓存策略

对于频繁查询的数据，可以添加缓存：
```javascript
// 示例：缓存供应商列表
const CACHE_TTL = 5 * 60 * 1000; // 5分钟
let suppliersCache = null;
let cacheTime = 0;

app.get('/api/suppliers', async (c) => {
  const now = Date.now();
  if (suppliersCache && (now - cacheTime) < CACHE_TTL) {
    return c.json(suppliersCache);
  }
  
  // 查询数据库...
  suppliersCache = result;
  cacheTime = now;
  
  return c.json(result);
});
```

### 3. 预热机制

函数包含了连接预热机制，减少冷启动延迟：
```javascript
ctx.waitUntil(keepWarm());
```

## 监控与调试

### 1. 查看日志

在EdgeOne控制台的函数详情页面可以查看：
- 执行日志
- 错误日志
- 性能指标

### 2. 本地调试

使用Cloudflare Wrangler进行本地开发：
```bash
npm install -g wrangler
wrangler dev --local
```

### 3. 性能监控

函数内置了性能监控：
```javascript
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${c.req.method} ${c.req.url} - ${duration}ms`);
});
```

## 故障排除

### 常见问题

1. **MongoDB连接失败**
   - 检查连接字符串是否正确
   - 确认IP白名单设置（设为0.0.0.0/0）
   - 验证用户名密码

2. **函数超时**
   - 边缘函数有执行时间限制（通常30秒）
   - 优化数据库查询
   - 添加适当的索引

3. **CORS错误**
   - 检查CORS配置
   - 确认前端域名在允许列表中

4. **环境变量未生效**
   - 在EdgeOne控制台中正确配置环境变量
   - 重新部署函数

### 调试技巧

1. **添加详细日志**：
```javascript
console.log('Request:', {
  method: c.req.method,
  url: c.req.url,
  headers: Object.fromEntries(c.req.headers.entries())
});
```

2. **错误追踪**：
```javascript
app.onError((err, c) => {
  console.error('详细错误信息:', {
    message: err.message,
    stack: err.stack,
    url: c.req.url,
    timestamp: new Date().toISOString()
  });
});
```

## 成本分析

### EdgeOne边缘函数免费额度

- **请求次数**：每月100万次免费
- **执行时间**：每月40万GB-秒免费
- **带宽**：每月10GB免费

### 预估使用量

对于中小型库存管理系统：
- 日均API请求：1000-5000次
- 月均请求：3-15万次
- 执行时间：平均50ms/请求
- 月均执行时间：约2.5-7.5万GB-秒

**结论**：完全在免费额度内，零成本运行！

## 扩展功能

### 1. 添加认证中间件

```javascript
const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ message: '未授权访问' }, 401);
  }
  
  // 验证JWT token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ message: 'Token无效' }, 401);
  }
};

// 应用到需要认证的路由
app.use('/api/products/*', authMiddleware);
```

### 2. 添加限流保护

```javascript
const rateLimiter = new Map();

const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return async (c, next) => {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimiter.has(ip)) {
      rateLimiter.set(ip, []);
    }
    
    const requests = rateLimiter.get(ip).filter(time => time > windowStart);
    
    if (requests.length >= maxRequests) {
      return c.json({ message: '请求过于频繁' }, 429);
    }
    
    requests.push(now);
    rateLimiter.set(ip, requests);
    
    await next();
  };
};

app.use('*', rateLimit());
```

### 3. 添加数据验证

```javascript
const validateProduct = async (c, next) => {
  const data = await c.req.json();
  
  const errors = [];
  if (!data.name) errors.push('商品名称不能为空');
  if (!data.code) errors.push('商品编码不能为空');
  if (!data.category) errors.push('商品分类不能为空');
  if (data.purchasePrice < 0) errors.push('采购价格不能为负数');
  
  if (errors.length > 0) {
    return c.json({ success: false, errors }, 400);
  }
  
  c.set('validatedData', data);
  await next();
};

app.post('/api/products', validateProduct, async (c) => {
  const data = c.get('validatedData');
  // 处理已验证的数据...
});
```

## 总结

通过EdgeOne边缘函数部署，您可以获得：

1. **零成本运行** - 完全免费的后端服务
2. **全球加速** - 边缘节点就近响应
3. **高可用性** - 无需担心服务器维护
4. **自动扩缩容** - 根据流量自动调整
5. **国内优化** - 针对中国大陆网络优化

这是一个理想的中小型项目部署方案，既节省成本又保证性能！

## 下一步

1. 完成边缘函数部署
2. 测试所有API接口
3. 部署前端到EdgeOne Pages
4. 配置自定义域名（可选）
5. 设置监控告警（可选）

如有任何问题，请参考腾讯云EdgeOne官方文档或联系技术支持。