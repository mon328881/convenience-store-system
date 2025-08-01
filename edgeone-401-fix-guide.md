# EdgeOne 401错误修复指南

## 🚨 问题描述
访问EdgeOne部署的网站时显示：
```
401: UNAUTHORIZED
抱歉，您暂时无法访问该网站
```

## 🔍 问题分析
根据构建日志分析，项目构建成功，但访问时出现401错误，主要原因是：

1. **环境变量未配置**：EdgeOne控制台中缺少必要的环境变量
2. **Supabase配置缺失**：前端应用需要Supabase数据库连接配置
3. **构建时环境变量未生效**：构建过程中未正确读取环境变量

## ✅ 解决方案

### 步骤1：在EdgeOne控制台配置环境变量

1. **登录腾讯云EdgeOne控制台**
   - 访问：https://console.cloud.tencent.com/edgeone
   - 选择您的项目：`convenience-store-system`

2. **进入Pages项目设置**
   - 点击您的Pages项目
   - 进入"设置" → "环境变量"

3. **添加以下环境变量**：
   ```
   VITE_DEPLOYMENT_TYPE=edgeone
   VITE_EDGEONE_API_URL=https://1371559131-0yd2evf4vy.ap-beijing.tencentscf.com
   VITE_SUPABASE_URL=https://nxogjfzasogjzbkpfwle.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MjU2NzcsImV4cCI6MjA1MTMwMTY3N30.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
   VITE_APP_NAME=库存管理系统
   VITE_ENABLE_MOCK=false
   VITE_ENABLE_DEBUG=false
   ```

### 步骤2：重新部署项目

配置环境变量后，必须重新触发部署：

**方法1：手动重新部署**
- 在EdgeOne控制台中点击"重新部署"按钮

**方法2：推送代码触发自动部署**
- 对Git仓库进行任意小的更改并推送
- 系统会自动触发重新构建和部署

### 步骤3：验证部署结果

1. **检查构建日志**
   - 确认环境变量在构建过程中被正确读取
   - 查看是否有相关错误信息

2. **访问网站**
   - 等待部署完成后访问网站
   - 检查是否还有401错误

3. **浏览器开发者工具检查**
   - 打开F12开发者工具
   - 查看Console是否有JavaScript错误
   - 检查Network面板的请求状态

## 🔧 构建命令验证

确保EdgeOne中的构建设置正确：
```bash
构建命令: cd frontend && npm install && cp .env.edgeone .env && npm run build
输出目录: frontend/dist
Node.js版本: 18.x
```

## 📋 环境变量检查清单

- [ ] `VITE_DEPLOYMENT_TYPE` = `edgeone`
- [ ] `VITE_EDGEONE_API_URL` = `https://1371559131-0yd2evf4vy.ap-beijing.tencentscf.com`
- [ ] `VITE_SUPABASE_URL` = `https://nxogjfzasogjzbkpfwle.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = 完整的JWT token
- [ ] `VITE_APP_NAME` = `库存管理系统`
- [ ] `VITE_ENABLE_MOCK` = `false`

## 🚀 快速修复脚本

如果您有EdgeOne CLI工具，可以使用以下命令快速配置：

```bash
# 设置环境变量（需要EdgeOne CLI）
edgeone env set VITE_DEPLOYMENT_TYPE=edgeone
edgeone env set VITE_EDGEONE_API_URL=https://1371559131-0yd2evf4vy.ap-beijing.tencentscf.com
edgeone env set VITE_SUPABASE_URL=https://nxogjfzasogjzbkpfwle.supabase.co
edgeone env set VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MjU2NzcsImV4cCI6MjA1MTMwMTY3N30.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
edgeone env set VITE_APP_NAME=库存管理系统
edgeone env set VITE_ENABLE_MOCK=false

# 重新部署
edgeone deploy
```

## ⚠️ 注意事项

1. **环境变量必须以VITE_开头**：Vite构建工具只会处理以`VITE_`开头的环境变量
2. **配置后必须重新部署**：环境变量更改后必须重新构建项目才能生效
3. **检查Supabase密钥**：确保Supabase匿名密钥是有效的JWT token
4. **API地址验证**：确认后端API地址可以正常访问

## 📞 如果问题仍然存在

如果按照以上步骤操作后问题仍然存在，请：

1. 检查腾讯云EdgeOne服务状态
2. 验证域名解析是否正确
3. 联系腾讯云技术支持
4. 查看项目的其他部署文档

---

**最后更新时间**：2024年1月
**适用版本**：EdgeOne Pages服务