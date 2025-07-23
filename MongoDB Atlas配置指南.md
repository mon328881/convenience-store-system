# 🗄️ MongoDB Atlas 免费数据库配置指南

MongoDB Atlas 是 MongoDB 官方提供的云数据库服务，提供 512MB 免费存储空间，非常适合开发和小型项目。

## 📋 配置步骤

### 第一步：注册 MongoDB Atlas 账号

1. **访问 MongoDB Atlas**：https://cloud.mongodb.com
2. **注册账号**：
   - 点击 "Try Free"
   - 使用邮箱注册或 Google 账号登录
   - 填写基本信息（选择 "I'm learning MongoDB"）

### 第二步：创建项目

1. **创建组织**（新用户会自动创建）
2. **创建项目**：
   - 项目名称：`convenience-store-system`
   - 点击 "Next" → "Create Project"

### 第三步：创建免费集群

1. **选择部署方式**：
   - 选择 "Shared" （免费选项）
   - 点击 "Create"

2. **配置集群**：
   - **Cloud Provider**: AWS（推荐）
   - **Region**: 选择离你最近的区域
     - 🇨🇳 中国用户推荐：Singapore (ap-southeast-1)
     - 🇺🇸 美国用户推荐：N. Virginia (us-east-1)
   - **Cluster Tier**: M0 Sandbox（免费，512MB 存储）
   - **Cluster Name**: `Cluster0`（默认即可）

3. **点击 "Create Cluster"**
   - ⏱️ 等待 1-3 分钟创建完成

### 第四步：配置数据库访问

#### 4.1 创建数据库用户
1. 在左侧菜单点击 "Database Access"
2. 点击 "Add New Database User"
3. **配置用户**：
   - **Authentication Method**: Password
   - **Username**: `admin`（推荐）
   - **Password**: 点击 "Autogenerate Secure Password"
   - **⚠️ 重要**：复制并保存密码到安全的地方！
   - **Database User Privileges**: 选择 "Read and write to any database"
4. 点击 "Add User"

#### 4.2 配置网络访问
1. 在左侧菜单点击 "Network Access"
2. 点击 "Add IP Address"
3. **配置访问权限**：
   - 点击 "Allow Access from Anywhere"
   - IP Address 会自动填入 `0.0.0.0/0`
   - Comment: `Allow all IPs for development`
4. 点击 "Confirm"

### 第五步：获取连接字符串

1. **返回 Clusters 页面**：
   - 点击左侧 "Database" → "Clusters"
2. **获取连接字符串**：
   - 点击你的集群旁边的 "Connect" 按钮
   - 选择 "Connect your application"
   - **Driver**: Node.js
   - **Version**: 4.1 or later
3. **复制连接字符串**：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 第六步：配置环境变量

#### 6.1 本地开发环境
1. 在项目根目录创建 `.env` 文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，替换数据库连接字符串：
   ```env
   # 将连接字符串中的占位符替换为实际值
   MONGODB_URI=mongodb+srv://admin:你的密码@cluster0.xxxxx.mongodb.net/convenience_store?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   PORT=3000
   ```

#### 6.2 Vercel 部署环境
在 Vercel 项目设置中添加环境变量：
- `MONGODB_URI`: 你的 MongoDB Atlas 连接字符串
- `JWT_SECRET`: 随机生成的安全密钥
- `NODE_ENV`: `production`

## 🔧 连接字符串示例

**原始连接字符串**：
```
mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**配置后的连接字符串**：
```
mongodb+srv://admin:MySecurePassword123@cluster0.abc123.mongodb.net/convenience_store?retryWrites=true&w=majority
```

## ✅ 验证连接

### 方法一：使用 MongoDB Compass（推荐）
1. 下载 MongoDB Compass：https://www.mongodb.com/products/compass
2. 使用连接字符串连接到数据库
3. 查看是否能成功连接

### 方法二：在项目中测试
1. 启动后端服务：
   ```bash
   cd backend
   npm start
   ```
2. 查看控制台输出，应该显示 "Connected to MongoDB"

## 🚨 安全注意事项

1. **密码安全**：
   - 使用强密码
   - 不要在代码中硬编码密码
   - 使用环境变量存储敏感信息

2. **网络访问**：
   - 生产环境建议限制 IP 访问
   - 定期检查访问日志

3. **用户权限**：
   - 为不同环境创建不同的用户
   - 遵循最小权限原则

## 📊 免费额度说明

MongoDB Atlas M0 免费集群提供：
- **存储空间**：512MB
- **连接数**：最多 500 个并发连接
- **数据传输**：无限制
- **备份**：不包含自动备份
- **监控**：基础监控功能

## 🔄 数据迁移

如果你之前使用本地 MongoDB，可以使用以下工具迁移数据：
- MongoDB Compass（图形界面）
- mongodump/mongorestore（命令行）
- MongoDB Atlas Live Migration Service

## 🆘 常见问题

### Q: 连接超时怎么办？
A: 检查网络访问设置，确保 IP 地址在白名单中

### Q: 认证失败怎么办？
A: 检查用户名和密码是否正确，确保用户有正确的权限

### Q: 免费额度用完了怎么办？
A: 可以升级到付费计划，或者清理不需要的数据

---

🎉 **配置完成后，你的便利店进销存系统就可以使用云数据库了！**

需要帮助？查看 [MongoDB Atlas 官方文档](https://docs.atlas.mongodb.com/)