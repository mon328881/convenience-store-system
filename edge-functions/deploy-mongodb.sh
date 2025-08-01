#!/bin/bash

echo "🚀 部署MongoDB版本云函数"
echo "=========================="

# 检查是否在正确目录
if [ ! -f "scf-deploy-mongodb/index.js" ]; then
    echo "❌ 错误：请在包含 scf-deploy-mongodb 目录的路径下运行此脚本"
    exit 1
fi

# 进入MongoDB版本目录
cd scf-deploy-mongodb

echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "📁 创建部署包..."
zip -r ../scf-mongodb-$(date +%Y%m%d-%H%M%S).zip . -x "*.git*" "node_modules/.cache/*" "*.DS_Store"

if [ $? -eq 0 ]; then
    echo "✅ 部署包创建成功！"
    echo ""
    echo "📋 下一步操作："
    echo "1. 登录腾讯云函数控制台"
    echo "2. 上传生成的 zip 文件"
    echo "3. 配置环境变量 MONGODB_URI"
    echo "4. 测试函数运行"
    echo ""
    echo "🔧 环境变量示例："
    echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/convenience_store?retryWrites=true&w=majority"
    echo ""
    echo "🧪 测试命令："
    echo "curl 'https://your-function-url/api/health'"
else
    echo "❌ 部署包创建失败"
    exit 1
fi