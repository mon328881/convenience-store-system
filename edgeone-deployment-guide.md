# 腾讯云EdgeOne前端部署指南

## 📋 准备工作

### 1. 确认构建完成
- 前端项目已构建完成（`frontend/dist` 目录存在）
- 部署包 `edgeone-deploy.tar.gz` 已创建
- Git仓库已更新到最新版本

### 2. Git仓库信息
- **仓库地址**: https://github.com/Jason-sui-1120/convenience-store-system.git
- **主分支**: main
- **最新提交**: 包含EdgeOne部署配置和Supabase集成

### 3. 环境变量配置
确保以下环境变量已正确配置：
```
VITE_DEPLOYMENT_TYPE=edgeone
VITE_EDGEONE_API_URL=https://1371559131-0yd2evf4vy.ap-beijing.tencentscf.com
VITE_SUPABASE_URL=https://nxogjfzasogjzbkpfwle.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=库存管理系统
VITE_ENABLE_MOCK=false
```

## 🚀 EdgeOne控制台部署步骤

### 方式一：Git仓库部署（推荐）

#### 1. 登录腾讯云控制台
- 访问 [腾讯云EdgeOne控制台](https://console.cloud.tencent.com/edgeone)
- 使用您的腾讯云账号登录

#### 2. 创建或选择项目
- 如果已有项目 `convenience-store-system`，直接选择
- 如果没有，点击"创建项目"，输入项目名称

#### 3. 创建Pages服务
- 在项目中点击"Pages"
- 点击"创建Pages"
- 选择"Git仓库"方式

#### 4. 连接Git仓库
- 选择"GitHub"作为代码源
- 授权访问GitHub账号
- 选择仓库：`Jason-sui-1120/convenience-store-system`
- 选择分支：`main`

#### 5. 配置构建设置
```
构建命令: cd frontend && npm install && cp .env.edgeone .env && npm run build
输出目录: frontend/dist
Node.js版本: 18.x
```

### 方式二：文件上传部署

#### 1-3. 同上述步骤1-3

#### 4. 上传部署包
- 选择"上传文件"方式
- 上传 `edgeone-deploy.tar.gz` 文件
- 系统会自动解压并部署
- 等待部署完成（通常需要1-3分钟）

### 第六步：配置环境变量

在项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|----|----|
| `VITE_DEPLOYMENT_TYPE` | `edgeone` | 部署类型 |
| `VITE_EDGEONE_API_URL` | `https://1371559131-0yd2evf4vy.ap-beijing.tencentscf.com` | API地址 |
| `VITE_APP_NAME` | `库存管理系统` | 应用名称 |
| `VITE_ENABLE_MOCK` | `false` | 禁用模拟数据 |

### 第七步：部署项目

1. 检查所有配置是否正确
2. 点击「部署」按钮
3. 等待构建和部署完成（通常需要2-5分钟）
4. 部署成功后会显示访问URL

## 部署后验证

### 1. 基础功能测试
- [ ] 访问前端页面，检查是否正常加载
- [ ] 检查页面样式是否正常
- [ ] 检查所有静态资源是否加载成功

### 2. API连接测试
- [ ] 打开浏览器开发者工具
- [ ] 检查网络请求是否正常
- [ ] 验证API响应是否正确

### 3. 功能模块测试
- [ ] 测试登录功能
- [ ] 测试商品管理模块
- [ ] 测试供应商管理模块
- [ ] 测试入库管理模块
- [ ] 测试出库管理模块
- [ ] 测试报表功能

## 常见问题排除

### 问题1：页面空白或加载失败
**可能原因**：
- 静态资源路径错误
- 环境变量配置错误

**解决方案**：
1. 检查浏览器控制台错误信息
2. 验证环境变量配置
3. 检查API地址是否可访问

### 问题2：API调用失败
**可能原因**：
- API地址配置错误
- 跨域问题
- 后端服务不可用

**解决方案**：
1. 验证API地址：`https://1371559131-0yd2evf4vy.ap-beijing.tencentscf.com/api/health`
2. 检查后端服务状态
3. 确认环境变量配置正确

### 问题3：样式异常
**可能原因**：
- CSS文件加载失败
- 静态资源路径错误

**解决方案**：
1. 检查网络面板中的CSS文件加载状态
2. 验证构建配置
3. 重新构建和部署

## 性能优化建议

### 1. 启用CDN加速
EdgeOne自动提供全球CDN加速，无需额外配置。

### 2. 启用Gzip压缩
在EdgeOne控制台中启用Gzip压缩，减少传输大小。

### 3. 配置缓存策略
- 静态资源（JS/CSS）：长期缓存
- HTML文件：短期缓存或不缓存

## 域名配置（可选）

### 1. 自定义域名
如果您有自己的域名：
1. 在EdgeOne控制台添加自定义域名
2. 配置DNS解析
3. 申请SSL证书

### 2. 子域名
可以为项目配置子域名，如：
- `admin.yourdomain.com`
- `inventory.yourdomain.com`

## 监控和维护

### 1. 访问统计
在EdgeOne控制台查看：
- 访问量统计
- 流量使用情况
- 错误率监控

### 2. 日志查看
- 访问日志
- 错误日志
- 性能指标

### 3. 自动部署
配置Git仓库自动部署：
- 代码推送自动触发构建
- 构建失败自动通知
- 回滚功能

## 费用说明

### EdgeOne免费额度
- 流量：每月10GB
- 请求数：每月100万次
- 存储：1GB

### 超出免费额度
- 流量：¥0.18/GB
- 请求：¥0.01/万次

## 技术支持

如遇到问题，可以：
1. 查看腾讯云EdgeOne官方文档
2. 提交工单获取技术支持
3. 参考项目中的其他部署文档

---

## 快速部署检查清单

- [ ] 前端项目已构建完成
- [ ] 部署包已创建
- [ ] 腾讯云账号已准备
- [ ] EdgeOne服务已开通
- [ ] 站点已创建或选择
- [ ] Pages项目已创建
- [ ] 环境变量已配置
- [ ] 文件已上传
- [ ] 部署已完成
- [ ] 功能测试已通过

完成以上步骤后，您的便利店进销存系统前端就成功部署到腾讯云EdgeOne了！