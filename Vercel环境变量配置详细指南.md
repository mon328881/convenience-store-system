# 🚀 Vercel 环境变量配置完整指南（2024最新版）

## 📋 需要配置的环境变量清单

根据你的项目，需要在Vercel中配置以下环境变量：

### 🔑 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MONGODB_URI` | `mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` | MongoDB数据库连接字符串 |
| `FRONTEND_URL` | `https://你的项目名.vercel.app` | 前端域名（用于CORS配置） |
| `JWT_SECRET` | `your-super-secret-jwt-key-here-2024-random-string` | JWT加密密钥 |
| `NODE_ENV` | `production` | 环境标识 |
| `PORT` | `3000` | 服务器端口 |

### 📁 可选的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `UPLOAD_PATH` | `./uploads` | 文件上传路径 |
| `MAX_FILE_SIZE` | `10485760` | 最大文件大小（10MB） |
| `EMAIL_HOST` | `smtp.gmail.com` | 邮件服务器（如需要） |
| `EMAIL_PORT` | `587` | 邮件端口 |
| `EMAIL_USER` | `your-email@gmail.com` | 邮件用户名 |
| `EMAIL_PASS` | `your-email-password` | 邮件密码 |

## 🎯 详细配置步骤（2024最新Vercel界面）

### 第一步：访问Vercel项目

1. **打开浏览器**，访问：https://vercel.com
2. **登录账号**（使用GitHub账号）
3. **找到项目**：在Dashboard中找到你的项目
4. **点击项目卡片**进入项目详情页

### 第二步：进入环境变量设置

1. **点击顶部导航栏的 "Settings" 标签**
2. **在左侧边栏中点击 "Environment Variables"**

### 第三步：添加环境变量

#### 🗄️ 1. 添加 MONGODB_URI

```
Name: MONGODB_URI
Value: mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
Environment: 
  ✅ Production
  ✅ Preview  
  ✅ Development
```

**操作步骤：**
1. 在 "Name" 输入框中输入：`MONGODB_URI`
2. 在 "Value" 输入框中粘贴上面的连接字符串
3. 在 "Environment" 部分，勾选所有三个选项
4. 点击 "Save" 按钮

#### 🌐 2. 添加 FRONTEND_URL

```
Name: FRONTEND_URL
Value: https://你的项目名.vercel.app
Environment: 
  ✅ Production
  ✅ Preview  
  ✅ Development
```

**⚠️ 重要提示：**
- 将 `你的项目名` 替换为你的实际Vercel项目域名
- 例如：`https://convenience-store-system.vercel.app`
- 可以在项目首页的 "Domains" 部分找到确切的域名

#### 🔐 3. 添加 JWT_SECRET

```
Name: JWT_SECRET
Value: MyConvenienceStore2024SecretKey!@#$%RandomString123456789
Environment: 
  ✅ Production
  ✅ Preview  
  ✅ Development
```

**💡 安全建议：**
- 使用至少32个字符的随机字符串
- 包含大小写字母、数字、特殊字符
- 不要使用默认值，请生成一个新的随机字符串

#### ⚙️ 4. 添加 NODE_ENV

```
Name: NODE_ENV
Value: production
Environment: 
  ✅ Production
  ✅ Preview  
  ✅ Development
```

#### 🚪 5. 添加 PORT

```
Name: PORT
Value: 3000
Environment: 
  ✅ Production
  ✅ Preview  
  ✅ Development
```

### 第四步：添加可选环境变量（如需要）

按照相同的步骤添加其他环境变量：

- `UPLOAD_PATH` = `./uploads`
- `MAX_FILE_SIZE` = `10485760`
- 邮件相关变量（如果你的应用需要发送邮件）

### 第五步：保存并重新部署

1. **确认所有变量已保存**：每个变量添加后都会显示在列表中
2. **触发重新部署**：
   - 方法一：点击 "Deployments" 标签，找到最新部署，点击 "Redeploy"
   - 方法二：推送新的代码到GitHub（会自动触发部署）

## 🔍 验证配置是否成功

### 方法一：检查部署日志

1. 进入 "Deployments" 页面
2. 点击最新的部署记录
3. 查看 "Build Logs" 和 "Function Logs"
4. 确认没有环境变量相关的错误

### 方法二：测试应用功能

1. 访问你的Vercel应用URL
2. 测试前端页面是否正常加载
3. 测试API接口是否正常工作
4. 尝试添加/查看数据，验证数据库连接

### 方法三：检查网络请求

1. 打开浏览器开发者工具（F12）
2. 查看 "Network" 标签
3. 确认API请求返回正确的数据而不是错误

## 🚨 常见问题及解决方案

### ❌ 问题1：CORS错误
**症状：** 前端无法访问后端API
**解决方案：** 确保 `FRONTEND_URL` 设置为正确的Vercel域名

### ❌ 问题2：数据库连接失败
**症状：** API返回数据库连接错误
**解决方案：** 
- 检查 `MONGODB_URI` 是否正确
- 确保MongoDB Atlas允许Vercel的IP访问（设置为0.0.0.0/0）

### ❌ 问题3：环境变量未生效
**症状：** 配置了变量但应用仍报错
**解决方案：**
- 确保变量名拼写正确（区分大小写）
- 确保选择了所有环境（Production, Preview, Development）
- 重新部署项目

## 📱 移动端操作提示

如果使用手机配置：
1. 建议使用桌面浏览器或切换到桌面版视图
2. 环境变量输入框较小，建议先在记事本中准备好内容再粘贴

## ✅ 配置完成检查清单

- [ ] 已添加 `MONGODB_URI` 环境变量
- [ ] 已添加 `FRONTEND_URL` 环境变量（使用正确的Vercel域名）
- [ ] 已添加 `JWT_SECRET` 环境变量（使用强密码）
- [ ] 已添加 `NODE_ENV` 环境变量
- [ ] 已添加 `PORT` 环境变量
- [ ] 所有变量都选择了三个环境
- [ ] 已重新部署项目
- [ ] 应用可以正常访问
- [ ] API接口正常工作
- [ ] 数据库功能正常

## 🎉 配置完成后的下一步

1. **测试完整功能**：登录、添加商品、查看报表等
2. **监控应用性能**：在Vercel Dashboard中查看访问统计
3. **设置自定义域名**（可选）：在 "Domains" 部分添加自己的域名

---

🎯 **完成以上配置后，你的便利店进销存系统就可以在Vercel上正常运行了！**

如有问题，可以查看Vercel的实时日志来排查具体错误。