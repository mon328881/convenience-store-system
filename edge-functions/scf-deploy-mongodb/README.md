# 便利店进销存系统 - MongoDB版本

## 📋 概述

这是使用真实MongoDB数据库的云函数版本，替代了之前使用内存模拟数据的方案。

## 🔧 环境变量配置

在腾讯云函数控制台中配置以下环境变量：

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/convenience_store?retryWrites=true&w=majority
```

## 🚀 部署步骤

1. **安装依赖**
   ```bash
   cd scf-deploy-mongodb
   npm install
   ```

2. **打包部署**
   ```bash
   zip -r scf-mongodb.zip .
   ```

3. **上传到腾讯云函数**
   - 登录腾讯云函数控制台
   - 创建新函数或更新现有函数
   - 上传 `scf-mongodb.zip`
   - 配置环境变量 `MONGODB_URI`

## 🎯 主要改进

### 1. **真实数据库存储**
- 使用MongoDB Atlas云数据库
- 数据持久化存储
- 支持复杂查询和索引

### 2. **数据模型**
- 供应商模型：完整的字段验证和索引
- 商品模型：库存管理和价格体系
- 入库/出库记录：完整的业务流程

### 3. **自动初始化**
- 首次运行时自动创建初始数据
- 避免重复初始化
- 保持数据一致性

### 4. **错误处理**
- 完善的数据库连接错误处理
- 数据验证和业务逻辑检查
- 友好的错误信息返回

## 📊 API接口

### 供应商管理
- `GET /api/suppliers` - 获取供应商列表（支持搜索、分页）
- `POST /api/suppliers` - 创建新供应商
- `GET /api/suppliers/:id` - 获取单个供应商
- `PUT /api/suppliers/:id` - 更新供应商
- `DELETE /api/suppliers/:id` - 删除供应商

### 商品管理
- `GET /api/products` - 获取商品列表（支持搜索、分页）
- `POST /api/products` - 创建新商品

### 系统
- `GET /api/health` - 健康检查

## 🔍 数据一致性

使用真实数据库后，不再存在以下问题：
- ✅ 数据在函数实例间保持一致
- ✅ 更新操作不会丢失字段
- ✅ 支持事务和并发控制
- ✅ 数据持久化存储

## 🛠️ 故障排除

### MongoDB连接问题
1. 检查 `MONGODB_URI` 环境变量是否正确
2. 确认MongoDB Atlas IP白名单包含 `0.0.0.0/0`
3. 验证数据库用户权限

### 性能优化
1. 使用连接池复用连接
2. 合理设置超时时间
3. 创建必要的数据库索引

## 📈 迁移建议

### 从模拟数据迁移
1. 备份现有模拟数据
2. 部署MongoDB版本
3. 验证数据完整性
4. 切换前端API地址

### 生产环境部署
1. 使用专用MongoDB集群
2. 配置备份策略
3. 监控数据库性能
4. 设置告警机制