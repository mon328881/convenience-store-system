# Render 部署指南

## 概述
本指南将帮助你将便利店进销存系统部署到Render平台，包括前端、后端API和MongoDB数据库。

## 部署方式选择

### 方式一：Blueprint一键部署（推荐）
使用 `render.yaml` 配置文件一次性部署所有服务。

### 方式二：手动分别部署
分别创建Web Service、Static Site和PostgreSQL数据库。

## 准备工作

### 1. 代码准备
确保你的代码已推送到GitHub仓库：
```bash
git add .
git commit -m "准备Render部署"
git push origin main
```

### 2. 环境变量准备
准备以下环境变量值：
- `MONGODB_URI`: MongoDB连接字符串
- `JWT_SECRET`: JWT密钥（建议32位随机字符串）
- `NODE_ENV`: production
- `FRONTEND_URL`: 前端域名（部署后获得）

## 部署步骤

### 方式一：Blueprint部署

1. **登录Render**
   - 访问 https://render.com
   - 使用GitHub账号登录

2. **创建Blueprint**
   - 点击 "New" → "Blueprint"
   - 连接你的GitHub仓库
   - 选择包含 `render.yaml` 的仓库
   - Render会自动读取配置文件

3. **配置环境变量**
   - 在Blueprint创建过程中，Render会提示配置环境变量
   - 设置 `MONGODB_URI`（如果使用外部MongoDB）
   - 其他变量会自动生成或从服务间引用

4. **部署**
   - 点击 "Create Blueprint"
   - 等待所有服务部署完成（约5-10分钟）

### 方式二：手动部署

#### 2.1 部署后端API

1. **创建Web Service**
   - 点击 "New" → "Web Service"
   - 连接GitHub仓库
   - 配置如下：
     - **Name**: ke-inventory-api
     - **Environment**: Node
     - **Build Command**: `cd api && npm install`
     - **Start Command**: `cd api && npm start`
     - **Plan**: Free

2. **配置环境变量**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=你的MongoDB连接字符串
   JWT_SECRET=你的32位随机密钥
   FRONTEND_URL=https://你的前端域名.onrender.com
   ```

3. **设置健康检查**
   - Health Check Path: `/health`

#### 2.2 部署前端

1. **创建Static Site**
   - 点击 "New" → "Static Site"
   - 连接同一个GitHub仓库
   - 配置如下：
     - **Name**: ke-inventory-frontend
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`

2. **配置环境变量**
   ```
   VITE_API_URL=https://你的API域名.onrender.com
   ```

3. **配置重定向规则**
   在 `frontend/public/_redirects` 文件中添加：
   ```
   /*    /index.html   200
   ```

#### 2.3 配置数据库

**选项A：使用Render的PostgreSQL（推荐）**
1. 创建PostgreSQL数据库
2. 修改后端代码以支持PostgreSQL

**选项B：使用外部MongoDB Atlas**
1. 在MongoDB Atlas创建免费集群
2. 获取连接字符串
3. 在Render环境变量中设置 `MONGODB_URI`

## 部署后配置

### 1. 更新CORS配置
确保后端API的CORS配置包含Render域名：
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://你的前端域名.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);
```

### 2. 更新前端API配置
确保前端正确配置API地址：
```javascript
// frontend/src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://你的API域名.onrender.com';
```

### 3. 测试部署
1. 访问前端URL测试界面加载
2. 测试登录功能
3. 测试API接口调用
4. 检查数据库连接

## 常见问题解决

### 1. 冷启动问题
- Render免费层级有冷启动延迟（约50秒）
- 可以设置定时任务保持服务活跃

### 2. 环境变量问题
- 确保所有必需的环境变量都已设置
- 检查变量名拼写是否正确

### 3. 构建失败
- 检查 `package.json` 中的构建命令
- 确保所有依赖都在 `dependencies` 中

### 4. 数据库连接问题
- 检查MongoDB连接字符串格式
- 确保数据库允许来自Render的连接

## 监控和维护

### 1. 查看日志
- 在Render Dashboard中查看服务日志
- 监控错误和性能指标

### 2. 自动部署
- 推送到main分支会自动触发重新部署
- 可以在Dashboard中手动触发部署

### 3. 域名配置
- 可以配置自定义域名
- Render提供免费SSL证书

## 成本说明

### 免费层级限制
- **Web Service**: 750小时/月，15分钟无活动后休眠
- **Static Site**: 无限制
- **PostgreSQL**: 1GB存储，90天后删除

### 升级选项
- **Starter Plan**: $7/月，无休眠
- **Standard Plan**: $25/月，更多资源

## 备用方案

如果Render免费层级不满足需求，可以考虑：
1. **Fly.io**: 按使用量付费
2. **Railway**: $5/月起
3. **Netlify + Supabase**: 前端+后端分离部署

## 支持

如果遇到问题：
1. 查看Render官方文档
2. 检查GitHub仓库的Issues
3. 联系技术支持

---

**注意**: 免费层级适合开发和测试，生产环境建议使用付费计划以获得更好的性能和可靠性。