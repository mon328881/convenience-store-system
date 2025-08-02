# 便利店进销存系统 - Render 部署版本

## 便利店进销存管理系统

这是一个基于 Vue.js + Supabase PostgreSQL 的便利店进销存管理系统，现已配置为可在 Vercel 平台免费部署。

## 🚀 快速部署

### 前置条件
- [ ] GitHub 账号
- [ ] Vercel 账号
- [ ] Supabase 账号

### 部署步骤

1. **Fork 本仓库**
   ```bash
   # 点击 GitHub 页面右上角的 Fork 按钮
   ```

2. **配置 Supabase**
   - 在 Supabase 创建新项目
   - 获取项目 URL 和 anon key
   - 运行数据库迁移脚本创建表结构

3. **部署到 Vercel**
   - 连接 GitHub 仓库到 Vercel
   - 配置环境变量：
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **访问应用**
   - 部署完成后，通过 Vercel 提供的 URL 访问应用

## 💻 本地开发

```bash
# 克隆项目
git clone <your-repo-url>
cd convenience-store-system

# 安装依赖
cd frontend
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 Supabase 配置

# 启动开发服务器
npm run dev
```

## 🛠 技术栈

- **前端**: Vue 3 + Element Plus + Vite
- **数据库**: Supabase PostgreSQL
- **部署**: Vercel
- **状态管理**: Pinia
- **路由**: Vue Router

## 📋 功能特性

- ✅ 商品管理（增删改查）
- ✅ 供应商管理
- ✅ 入库管理
- ✅ 出库管理
- ✅ 库存统计
- ✅ 数据可视化
- ✅ 响应式设计

## 🔧 配置说明

### 环境变量
```bash
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 文档

- [便利店进销存系统使用指南.md](./便利店进销存系统使用指南.md) - 系统使用说明
- [便利店进销存系统PRD.md](./便利店进销存系统PRD.md) - 产品需求文档

## 🐛 故障排除

1. **部署失败**: 检查环境变量配置是否正确
2. **数据库连接失败**: 验证 Supabase 配置和网络连接
3. **页面加载异常**: 检查浏览器控制台错误信息

## 🛠️ 部署工具包

### 核心脚本
- `frontend/` - Vue.js 前端应用
- `supabase/` - 数据库迁移脚本

### 配置文件
- `.env.example` - 环境变量模板
- `vercel.json` - Vercel 部署配置

## 📊 系统架构

```
便利店进销存系统
├── 前端 (Vue 3 + Element Plus)
│   ├── 商品管理
│   ├── 供应商管理
│   ├── 入库管理
│   ├── 出库管理
│   └── 数据统计
└── 数据库 (Supabase PostgreSQL)
    ├── suppliers 表
    ├── products 表
    ├── supplier_products 表
    ├── inbound_records 表
    └── outbound_records 表
```

## 🎯 项目特色

- **零配置部署**: 一键部署到 Vercel
- **现代技术栈**: Vue 3 + Supabase
- **响应式设计**: 支持各种设备
- **实时数据**: Supabase 实时订阅
- **类型安全**: TypeScript 支持

## 📋 部署清单

### ✅ 已完成的配置
- [x] Vercel 部署配置文件 (`vercel.json`)
- [x] 前端 Supabase 配置
- [x] 环境变量配置模板
- [x] 部署脚本和文档

### 🔧 需要手动配置的项目
- [ ] Supabase 项目创建
- [ ] Vercel 环境变量设置
- [ ] 域名和 SSL 证书（自动）

## 📁 项目结构
```
ke/
├── frontend/              # 前端 Vue.js 应用
│   ├── src/               # 源代码
│   ├── package.json       # 前端依赖
│   └── dist/              # 构建输出
├── backend/               # 后端配置和工具
│   └── src/config/        # Supabase 配置
├── supabase/              # 数据库迁移脚本
├── vercel.json            # Vercel 部署配置
└── .env.example           # 环境变量模板
```

## 🌐 部署后的访问地址
- **应用**: https://your-app.vercel.app
- **数据库**: Supabase Dashboard

## 🔑 环境变量配置

### 前端必需变量
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 💰 成本说明

### Vercel 免费层级
- **静态网站**: 无限制，全球 CDN
- **函数调用**: 100GB-小时/月
- **带宽**: 100GB/月

### Supabase 免费层级
- **数据库**: 500MB 存储
- **API 请求**: 50,000 次/月
- **实时连接**: 200 个并发

### 总成本
完全免费（适合开发和小型项目）

## ⚠️ 重要提醒

1. **环境变量**: 部署后必须配置所有必需的环境变量
2. **数据库迁移**: 首次部署需要运行数据库迁移脚本
3. **域名配置**: Vercel 自动提供 HTTPS 域名

## 🔧 本地开发

```bash
# 安装依赖
cd frontend && npm install

# 启动开发服务器
npm run dev  # 前端 (http://localhost:5173)
```

## 📚 相关文档
- [便利店进销存系统使用指南.md](./便利店进销存系统使用指南.md) - 系统使用说明
- [便利店进销存系统PRD.md](./便利店进销存系统PRD.md) - 产品需求文档

## 🆘 故障排除

### 常见问题
1. **部署失败**: 检查环境变量配置是否正确
2. **数据库连接失败**: 验证 Supabase 配置和网络连接
3. **页面加载异常**: 检查浏览器控制台错误信息

### 获取帮助
- 查看 Vercel Dashboard 中的部署日志
- 检查 Supabase Dashboard 中的日志
- 参考官方文档: https://vercel.com/docs 和 https://supabase.com/docs

## 🎉 部署成功后
1. 访问应用地址测试界面
2. 验证各个功能模块
3. 配置自定义域名（可选）

---

**祝你部署顺利！** 🚀

如有问题，请参考相关文档或检查部署日志。