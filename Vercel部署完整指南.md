# 🚀 Vercel 部署完整指南

## 📋 部署前准备

### 1. 确保项目配置正确
- ✅ `vercel.json` 已更新为全栈应用配置
- ✅ 前端API配置使用 `/api` 路径
- ✅ 后端服务器配置正确

### 2. 准备环境变量
在部署前，请准备以下环境变量：

```
MONGODB_URI=mongodb+srv://用户名:密码@cluster0.xxxxx.mongodb.net/convenience_store?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=production
```

## 🎯 部署方法

### 方法一：使用 Vercel CLI（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **运行部署脚本**
   ```bash
   ./deploy-vercel.sh
   ```

### 方法二：通过 GitHub 自动部署

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "更新Vercel配置，准备部署"
   git push
   ```

2. **在 Vercel 中连接 GitHub 仓库**
   - 访问 https://vercel.com/dashboard
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 导入项目

3. **配置项目设置**
   - Framework Preset: 选择 "Other"
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

## ⚙️ 环境变量配置

### 在 Vercel Dashboard 中配置

1. **进入项目设置**
   - 在 Vercel Dashboard 中找到你的项目
   - 点击项目名称进入详情页
   - 点击 "Settings" 标签

2. **添加环境变量**
   - 点击左侧 "Environment Variables"
   - 添加以下变量：

   ```
   Name: MONGODB_URI
   Value: mongodb+srv://你的用户名:你的密码@cluster0.xxxxx.mongodb.net/convenience_store?retryWrites=true&w=majority
   Environment: Production, Preview, Development (全选)
   ```

   ```
   Name: JWT_SECRET
   Value: MyApp2024SecretKey!@#RandomString123456789
   Environment: Production, Preview, Development (全选)
   ```

   ```
   Name: NODE_ENV
   Value: production
   Environment: Production, Preview, Development (全选)
   ```

3. **保存并重新部署**
   - 保存所有环境变量
   - 在 "Deployments" 页面重新部署项目

## 🔍 部署验证

### 1. 检查部署状态
- 在 Vercel Dashboard 查看部署日志
- 确认构建过程没有错误
- 检查函数部署是否成功

### 2. 测试应用功能
访问你的 Vercel 应用 URL，测试以下功能：

- ✅ 前端页面正常加载
- ✅ 导航菜单正常工作
- ✅ API 请求正常响应
- ✅ 数据库连接成功
- ✅ 各个页面功能正常

### 3. 测试 API 端点
可以直接访问以下 API 端点测试：

```
https://你的域名.vercel.app/api/products
https://你的域名.vercel.app/api/suppliers
https://你的域名.vercel.app/api/reports/stats
```

## 🚨 常见问题解决

### 问题 1：404 错误
**原因**：路由配置问题
**解决方案**：
- 检查 `vercel.json` 中的路由配置
- 确保前端构建输出目录正确

### 问题 2：API 请求失败
**原因**：后端函数部署失败或环境变量缺失
**解决方案**：
- 检查 Vercel 函数日志
- 验证环境变量配置
- 确认 MongoDB 连接字符串正确

### 问题 3：数据库连接失败
**原因**：MongoDB Atlas 配置问题
**解决方案**：
- 检查 MongoDB Atlas 网络访问设置
- 确认数据库用户权限
- 验证连接字符串格式

### 问题 4：构建失败
**原因**：依赖安装或构建脚本问题
**解决方案**：
- 检查 package.json 中的依赖
- 确认构建命令正确
- 查看构建日志详细错误信息

## 📱 移动端访问

部署成功后，你的应用将支持：
- 📱 移动端响应式设计
- 💻 桌面端完整功能
- 🌐 跨平台访问

## 🔄 更新部署

当你需要更新应用时：

1. **修改代码后推送**
   ```bash
   git add .
   git commit -m "更新功能"
   git push
   ```

2. **Vercel 会自动重新部署**
   - 每次推送到主分支都会触发自动部署
   - 可以在 Dashboard 中查看部署进度

## 🎉 部署成功

恭喜！你的便利店进销存系统现在已经成功部署到云端了！

**你的应用现在具备：**
- ☁️ 云端数据库存储
- 🚀 全球 CDN 加速
- 📱 移动端适配
- 🔒 安全的 HTTPS 访问
- 🔄 自动部署更新

**分享你的应用：**
- 将 Vercel 提供的 URL 分享给其他人
- 可以绑定自定义域名
- 支持多人同时使用

需要帮助？查看 [Vercel 官方文档](https://vercel.com/docs) 或联系技术支持。