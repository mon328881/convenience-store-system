#!/bin/bash

# EdgeOne边缘函数部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署EdgeOne边缘函数..."

# 检查必要文件
if [ ! -f "index.js" ]; then
    echo "❌ 错误: 找不到 index.js 文件"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ 错误: 找不到 package.json 文件"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 找不到 .env 文件，请确保在EdgeOne控制台中配置了环境变量"
    echo "📝 参考 .env.example 文件配置以下变量:"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - NODE_ENV"
fi

# 创建部署包
echo "📦 创建部署包..."
DEPLOY_DIR="deploy"
ZIP_FILE="inventory-edge-function.zip"

# 清理旧的部署文件
rm -rf $DEPLOY_DIR
rm -f $ZIP_FILE

# 创建部署目录
mkdir -p $DEPLOY_DIR

# 复制必要文件
cp index.js $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/

# 创建ZIP包
echo "🗜️  压缩文件..."
cd $DEPLOY_DIR
zip -r ../$ZIP_FILE . -x "*.log" "*.env" "node_modules/*"
cd ..

# 清理临时目录
rm -rf $DEPLOY_DIR

echo "✅ 部署包创建完成: $ZIP_FILE"
echo ""
echo "📋 下一步操作:"
echo "1. 登录腾讯云EdgeOne控制台: https://console.cloud.tencent.com/edgeone"
echo "2. 进入边缘函数页面"
echo "3. 创建新函数或更新现有函数"
echo "4. 上传 $ZIP_FILE 文件"
echo "5. 配置环境变量:"
echo "   - MONGODB_URI: 您的MongoDB连接字符串"
echo "   - JWT_SECRET: JWT密钥"
echo "   - NODE_ENV: production"
echo "6. 配置HTTP触发器，路径匹配: /api/*"
echo "7. 保存并部署"
echo ""
echo "🔗 部署完成后，您的API将可通过以下地址访问:"
echo "   https://your-domain.edgeone.app/api/health"
echo ""
echo "🧪 测试命令:"
echo "   curl https://your-domain.edgeone.app/api/health"
echo ""
echo "📊 预期响应:"
echo '   {"status":"OK","timestamp":"...","service":"EdgeOne边缘函数","mongodb":"connected"}'