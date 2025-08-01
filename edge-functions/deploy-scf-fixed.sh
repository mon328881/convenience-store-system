#!/bin/bash

# 腾讯云函数部署脚本 - 修复版本
echo "开始部署库存管理系统到腾讯云函数（修复版本）..."

# 设置变量
DEPLOY_DIR="deploy-fixed"
ZIP_FILE="scf-deploy-fixed.zip"

# 清理旧的部署目录
echo "清理旧的部署目录..."
rm -rf $DEPLOY_DIR
rm -f $ZIP_FILE

# 创建部署目录
echo "创建部署目录..."
mkdir -p $DEPLOY_DIR

# 复制主要文件（只复制必要的文件）
echo "复制文件到部署目录..."
cp scf-fixed.js $DEPLOY_DIR/index.js
cp package-scf.json $DEPLOY_DIR/package.json

# 进入部署目录
cd $DEPLOY_DIR

# 不安装任何依赖，因为我们的代码是纯Node.js
echo "跳过依赖安装（使用纯Node.js代码）..."

# 返回上级目录
cd ..

# 创建部署包
echo "创建部署包..."
cd $DEPLOY_DIR
zip -r ../$ZIP_FILE .
cd ..

echo "部署包已创建: $ZIP_FILE"
echo ""
echo "修复说明："
echo "- 移除了Hono框架依赖"
echo "- 使用纯Node.js代码"
echo "- 修复了错误145问题"
echo ""
echo "请按照以下步骤完成部署："
echo "1. 登录腾讯云控制台"
echo "2. 进入云函数 SCF 服务"
echo "3. 找到现有的 inventory-api 函数"
echo "4. 点击'函数代码'选项卡"
echo "5. 选择'本地上传zip包'"
echo "6. 上传 $ZIP_FILE 文件"
echo "7. 确认配置："
echo "   - 运行环境: Node.js 18.15"
echo "   - 执行方法: index.main_handler"
echo "   - 内存: 128MB"
echo "   - 超时时间: 30秒"
echo "8. 点击'部署'按钮"
echo ""
echo "部署完成后，测试API端点："
echo "- GET /api/health - 健康检查"
echo "- GET /api/products - 获取商品列表"
echo "- GET /api/suppliers - 获取供应商列表"