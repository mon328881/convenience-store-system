# 🚀 Vercel 环境变量配置详细指南

本指南将帮你在 Vercel 中配置 MongoDB Atlas 数据库连接所需的环境变量。

## 📋 前提条件

在开始之前，请确保你已经：
- ✅ 完成了 MongoDB Atlas 数据库配置
- ✅ 获取了 MongoDB 连接字符串
- ✅ 项目已成功部署到 Vercel

## 🎯 配置步骤

### 第一步：访问 Vercel 项目

1. **打开浏览器**，访问：https://vercel.com
2. **登录你的账号**（使用 GitHub 账号登录）
3. **找到你的项目**：在 Dashboard 中找到 `convenience-store-system` 项目
4. **点击项目名称**进入项目详情页

### 第二步：进入环境变量设置

1. **点击 "Settings" 标签**（在项目页面顶部导航栏）
2. **在左侧菜单中点击 "Environment Variables"**

### 第三步：添加环境变量

你需要添加以下 3 个环境变量：

#### 🗄️ 变量 1：MONGODB_URI（数据库连接）

```
Name: MONGODB_URI
Value: mongodb+srv://你的用户名:你的密码@cluster0.xxxxx.mongodb.net/convenience_store?retryWrites=true&w=majority
Environment: Production, Preview, Development (全选)
```

**⚠️ 注意**：
- 将 `你的用户名` 替换为你在 MongoDB Atlas 中创建的用户名
- 将 `你的密码` 替换为对应的密码
- 将 `cluster0.xxxxx.mongodb.net` 替换为你的实际集群地址

#### 🔐 变量 2：JWT_SECRET（安全密钥）

```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-here-make-it-long-and-random-at-least-32-characters
Environment: Production, Preview, Development (全选)
```

**💡 建议**：
- 使用至少 32 个字符的随机字符串
- 可以包含字母、数字、特殊字符
- 示例：`MyApp2024SecretKey!@#$%^&*()_+RandomString123456789`

#### ⚙️ 变量 3：NODE_ENV（环境标识）

```
Name: NODE_ENV
Value: production
Environment: Production, Preview, Development (全选)
```

### 第四步：保存并重新部署

1. **保存所有变量**：每添加一个变量后点击 "Save"
2. **重新部署项目**：
   - 点击 "Deployments" 标签
   - 找到最新的部署记录
   - 点击右侧的三个点 "..." 菜单
   - 选择 "Redeploy"

## 🔍 验证配置

### 方法一：检查部署日志
1. 在 "Deployments" 页面，点击最新的部署
2. 查看 "Build Logs" 和 "Function Logs"
3. 确认没有数据库连接错误

### 方法二：访问应用
1. 部署完成后，访问你的 Vercel 应用网址
2. 如果页面正常加载且功能正常，说明配置成功

### 方法三：测试数据库功能
1. 尝试使用应用的各项功能（如添加商品、供应商等）
2. 如果能正常保存和读取数据，说明数据库连接成功

## 🚨 常见问题及解决方案

### ❌ 问题 1：连接字符串格式错误
**症状**：部署失败或数据库连接错误
**解决方案**：
- 检查连接字符串格式是否正确
- 确保用户名、密码中没有特殊字符需要编码
- 确保集群地址正确

### ❌ 问题 2：环境变量未生效
**症状**：配置了环境变量但应用仍然报错
**解决方案**：
- 确保保存环境变量后重新部署了项目
- 检查变量名是否拼写正确（区分大小写）
- 确保选择了正确的环境（Production, Preview, Development）

### ❌ 问题 3：数据库认证失败
**症状**：显示认证错误或权限不足
**解决方案**：
- 检查 MongoDB Atlas 中的用户名和密码
- 确保数据库用户有读写权限
- 检查网络访问设置（IP 白名单）

## 📱 移动端配置提示

如果你使用手机访问 Vercel：
1. 在移动浏览器中打开 https://vercel.com
2. 登录后可能需要切换到桌面版视图
3. 操作步骤与桌面版相同

## 🔄 更新环境变量

如果需要修改环境变量：
1. 回到 "Environment Variables" 页面
2. 找到要修改的变量，点击右侧的编辑按钮
3. 修改值后保存
4. 重新部署项目

## 🎉 配置完成检查清单

- [ ] 已添加 `MONGODB_URI` 环境变量
- [ ] 已添加 `JWT_SECRET` 环境变量  
- [ ] 已添加 `NODE_ENV` 环境变量
- [ ] 所有变量都选择了 Production, Preview, Development
- [ ] 已重新部署项目
- [ ] 应用可以正常访问
- [ ] 数据库功能正常工作

---

🎯 **完成以上步骤后，你的便利店进销存系统就可以在 Vercel 上使用 MongoDB Atlas 云数据库了！**

需要更多帮助？查看 [Vercel 官方文档](https://vercel.com/docs/concepts/projects/environment-variables)