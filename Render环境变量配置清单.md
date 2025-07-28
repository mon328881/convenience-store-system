# Render 环境变量配置清单

## 必需的环境变量

### 后端 API 服务 (ke-inventory-api)

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 运行环境 |
| `PORT` | `10000` | 端口号（Render自动分配） |
| `MONGODB_URI` | `mongodb+srv://用户名:密码@cluster.mongodb.net/数据库名` | MongoDB连接字符串 |
| `JWT_SECRET` | `32位随机字符串` | JWT密钥 |
| `FRONTEND_URL` | `https://你的前端域名.onrender.com` | 前端域名（用于CORS） |

### 前端静态网站 (ke-inventory-frontend)

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_URL` | `https://你的API域名.onrender.com` | API服务地址 |

## 环境变量获取方法

### 1. MongoDB连接字符串
```bash
# 从 MongoDB Atlas 获取
# 格式: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
# 示例: mongodb+srv://keuser:password123@cluster0.abc123.mongodb.net/convenience_store
```

### 2. JWT密钥生成
```bash
# 方法1: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法2: 使用 OpenSSL
openssl rand -hex 32

# 方法3: 在线生成
# 访问 https://generate-secret.vercel.app/32
```

### 3. 域名配置
```bash
# 部署完成后，Render会提供域名
# API服务: https://ke-inventory-api.onrender.com
# 前端服务: https://ke-inventory-frontend.onrender.com
```

## 配置步骤

### Blueprint 部署时
1. 在创建 Blueprint 时，Render 会提示配置环境变量
2. 按照上表填入对应的值
3. `FRONTEND_URL` 和 `VITE_API_URL` 可以在部署完成后更新

### 手动部署时
1. 在创建每个服务时，在 "Environment Variables" 部分添加
2. 或在服务创建后，在 Dashboard 的 "Environment" 标签页添加

## 安全注意事项

1. **不要在代码中硬编码敏感信息**
2. **JWT_SECRET 必须是强随机字符串**
3. **MongoDB 连接字符串包含密码，请妥善保管**
4. **定期更换密钥和密码**

## 验证配置

部署完成后，可以通过以下方式验证环境变量配置：

```bash
# 检查 API 健康状态
curl https://你的API域名.onrender.com/health

# 检查前端是否正确加载
curl https://你的前端域名.onrender.com
```

## 常见问题

### 1. MongoDB 连接失败
- 检查连接字符串格式是否正确
- 确保 MongoDB Atlas 允许来自任何 IP 的连接（0.0.0.0/0）
- 检查用户名和密码是否正确

### 2. CORS 错误
- 确保 `FRONTEND_URL` 配置正确
- 检查前端的 `VITE_API_URL` 是否指向正确的 API 地址

### 3. JWT 认证失败
- 确保 `JWT_SECRET` 在前后端配置一致
- 检查密钥长度是否足够（建议32位）

## 更新环境变量

1. 在 Render Dashboard 中找到对应服务
2. 点击 "Environment" 标签页
3. 修改或添加环境变量
4. 点击 "Save Changes"
5. 服务会自动重新部署