# 便利店进销存系统

一个基于 Vue.js + Node.js + MongoDB 的现代化便利店进销存管理系统。

## 🌟 功能特性

- 📊 **仪表板** - 实时数据统计和可视化图表
- 👥 **供应商管理** - 供应商信息的增删改查
- 📦 **商品管理** - 商品信息管理和库存监控
- 📥 **入库管理** - 商品入库记录和库存更新
- 📤 **出库管理** - 商品出库记录和库存扣减
- 📈 **统计报表** - 销售、库存、利润等数据分析

## 🚀 在线演示

**快速部署到云端，让所有人都能访问！**

### 一键部署到 Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/convenience-store-system)

### 部署步骤
1. 点击上方按钮或查看 [部署指南.md](./部署指南.md)
2. 配置 MongoDB Atlas 数据库
3. 设置环境变量
4. 一键部署完成！

## 💻 技术栈

### 前端
- Vue 3 + Composition API
- Element Plus UI 组件库
- Vue Router 路由管理
- Pinia 状态管理
- ECharts 数据可视化
- Vite 构建工具

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT 身份认证
- Express Validator 数据验证
- Helmet 安全防护
- Rate Limiting 限流保护

## 🛠️ 本地开发

### 环境要求
- Node.js 16+
- MongoDB 4.4+
- npm 或 yarn

### 快速启动
```bash
# 1. 克隆项目
git clone https://github.com/yourusername/convenience-store-system.git
cd convenience-store-system

# 2. 安装所有依赖
npm run install:all

# 3. 启动开发服务器
npm run dev
```

### 访问应用
- 🌐 前端: http://localhost:5173
- 🔧 后端: http://localhost:3000

## 📁 项目结构

```
便利店进销存系统/
├── frontend/          # 前端 Vue.js 应用
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── views/         # 页面组件
│   │   ├── router/        # 路由配置
│   │   ├── config/        # 配置文件
│   │   └── utils/         # 工具函数
│   └── package.json
├── backend/           # 后端 Node.js API
│   ├── src/
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # API 路由
│   │   └── middleware/    # 中间件
│   └── package.json
├── 部署指南.md         # 详细部署说明
└── README.md
```

## 📚 文档

- [📖 开发指南](./便利店进销存系统开发指南.md)
- [🚀 部署指南](./部署指南.md)
- [📋 产品需求](./便利店进销存系统PRD.md)
- [⚡ 启动指南](./便利店进销存系统启动指南.md)

## 🌍 部署选项

| 平台 | 前端 | 后端 | 数据库 | 费用 |
|------|------|------|--------|---------|
| **Vercel** | ✅ | ✅ | MongoDB Atlas | 免费 |
| **Netlify + Railway** | ✅ | ✅ | MongoDB Atlas | 免费 |
| **Heroku** | ✅ | ✅ | MongoDB Atlas | 免费额度 |
| **自建服务器** | ✅ | ✅ | 自建/云数据库 | 按需付费 |

## 🔧 环境变量

```bash
# 数据库
MONGODB_URI=mongodb://localhost:27017/convenience_store

# 安全
JWT_SECRET=your-super-secret-key

# 服务器
PORT=3000
NODE_ENV=production
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

⭐ 如果这个项目对你有帮助，请给个 Star！