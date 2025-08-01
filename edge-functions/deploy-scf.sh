#!/bin/bash

# 腾讯云函数部署脚本
echo "开始部署库存管理系统到腾讯云函数..."

# 设置变量
FUNCTION_NAME="inventory-management-api"
REGION="ap-beijing"
DEPLOY_DIR="./scf-deploy"

# 清理并创建部署目录
echo "准备部署目录..."
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# 复制必要文件
echo "复制文件..."
cp scf-fixed.js $DEPLOY_DIR/index.js
cp package-scf.json $DEPLOY_DIR/package.json

# 进入部署目录
cd $DEPLOY_DIR

# 安装依赖
echo "安装依赖..."
npm install --production

# 创建部署包
echo "创建部署包..."
zip -r ../scf-deploy.zip .

# 返回上级目录
cd ..

echo "部署包已创建: scf-deploy.zip"
echo ""
echo "请按照以下步骤完成部署："
echo "1. 登录腾讯云控制台"
echo "2. 进入云函数 SCF 服务"
echo "3. 创建新函数或更新现有函数"
echo "4. 上传 scf-deploy.zip 文件"
echo "5. 设置以下配置："
echo "   - 运行环境: Node.js 18.15"
echo "   - 执行方法: index.main_handler"
echo "   - 内存: 128MB"
echo "   - 超时时间: 30秒"
echo "6. 配置环境变量（如果需要）："
echo "   - MONGODB_URI: 你的MongoDB连接字符串"
echo "7. 配置API网关触发器"
echo ""
echo "部署完成后，你将获得一个API网关地址，可以用来访问你的库存管理API"