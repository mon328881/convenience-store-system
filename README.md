# 便利店进销存系统 - Render 部署版本

## 🎯 项目概述
这是一个基于 Vue.js + Express.js + MongoDB 的便利店进销存管理系统，现已配置为可在 Render 平台免费部署。

## 🚀 快速部署

### 方式一：超级一键部署（推荐）
```bash
# 1. 克隆项目
git clone <你的仓库地址>
cd ke

# 2. 运行超级一键部署脚本
./one-click-deploy.sh

# 3. 按照脚本指导在 Render 控制台完成部署

# 4. 验证部署结果
./verify-deployment.sh
```

### 方式二：简单一键部署
```bash
# 运行简单部署脚本
./deploy-render.sh
```

### 方式三：手动部署
详细步骤请参考 [Render部署指南.md](./Render部署指南.md)

## 🛠️ 部署工具包

| 工具 | 功能 | 适用场景 |
|------|------|----------|
| `one-click-deploy.sh` | 超级一键部署 | 新手用户，完整自动化 |
| `deploy-render.sh` | 简单部署 | 有经验用户，快速部署 |
| `verify-deployment.sh` | 部署验证 | 验证部署结果，故障排除 |

详细说明请参考 [部署工具包说明.md](./部署工具包说明.md)

## 📋 部署清单

### ✅ 已完成的配置
- [x] Render Blueprint 配置文件 (`render.yaml`)
- [x] 前端 API 地址动态配置
- [x] 后端 CORS 跨域配置
- [x] 环境变量配置模板
- [x] 部署脚本和文档

### 🔧 需要手动配置的项目
- [ ] MongoDB Atlas 数据库连接
- [ ] Render 环境变量设置
- [ ] 域名和 SSL 证书（自动）

## 📁 项目结构
```
ke/
├── api/                    # 后端 API 服务
│   ├── index.js           # 主入口文件
│   ├── package.json       # 后端依赖
│   └── src/               # 源代码
├── frontend/              # 前端 Vue.js 应用
│   ├── src/               # 源代码
│   ├── package.json       # 前端依赖
│   └── dist/              # 构建输出
├── render.yaml            # Render 部署配置
├── deploy-render.sh       # 部署脚本
├── Render部署指南.md       # 详细部署说明
└── Render环境变量配置清单.md # 环境变量配置
```

## 🌐 部署后的访问地址
- **前端**: https://ke-inventory.onrender.com
- **API**: https://ke-inventory-api.onrender.com
- **健康检查**: https://ke-inventory-api.onrender.com/health

## 🔑 环境变量配置

### 后端必需变量
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://用户名:密码@cluster.mongodb.net/数据库名
JWT_SECRET=32位随机字符串
FRONTEND_URL=https://ke-inventory.onrender.com
```

### 前端必需变量
```env
VITE_API_URL=https://ke-inventory-api.onrender.com
```

详细配置请参考 [Render环境变量配置清单.md](./Render环境变量配置清单.md)

## 💰 成本说明

### Render 免费层级
- **Web Service**: 750小时/月，15分钟无活动后休眠
- **Static Site**: 无限制，全球 CDN
- **PostgreSQL**: 1GB 存储（可选）

### 外部服务
- **MongoDB Atlas**: 512MB 免费层级
- **总成本**: 完全免费（适合开发和小型项目）

## ⚠️ 重要提醒

1. **冷启动延迟**: 免费层级有15分钟无活动休眠，首次访问需要50秒启动时间
2. **数据库配置**: 确保 MongoDB Atlas 允许来自任何 IP 的连接
3. **环境变量**: 部署后必须配置所有必需的环境变量
4. **域名更新**: 部署完成后需要更新前后端的域名配置

## 🔧 本地开发

```bash
# 安装依赖
cd frontend && npm install
cd ../api && npm install

# 启动开发服务器
npm run dev  # 前端 (http://localhost:5173)
cd api && npm run dev  # 后端 (http://localhost:3000)
```

## 📚 相关文档
- [Render部署指南.md](./Render部署指南.md) - 详细部署步骤
- [Render环境变量配置清单.md](./Render环境变量配置清单.md) - 环境变量配置
- [MongoDB Atlas配置指南.md](./MongoDB Atlas配置指南.md) - 数据库配置
- [便利店进销存系统开发指南.md](./便利店进销存系统开发指南.md) - 开发说明

## 🆘 故障排除

### 常见问题
1. **部署失败**: 检查 `package.json` 中的构建命令
2. **API 无法访问**: 检查环境变量配置
3. **数据库连接失败**: 检查 MongoDB 连接字符串和网络配置
4. **CORS 错误**: 检查前后端域名配置

### 获取帮助
- 查看 Render Dashboard 中的部署日志
- 检查服务的 "Logs" 标签页
- 参考官方文档: https://render.com/docs

## 🎉 部署成功后
1. 访问前端地址测试界面
2. 测试用户注册和登录功能
3. 验证各个功能模块
4. 配置自定义域名（可选）

---

**祝你部署顺利！** 🚀

如有问题，请参考相关文档或检查部署日志。