#!/bin/bash

echo "=== 腾讯云函数环境变量更新指南 ==="
echo ""

echo "🔍 发现问题：MongoDB URI缺少数据库名称"
echo ""

echo "❌ 原始URI（错误）："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
echo ""

echo "✅ 修正URI（正确）："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0"
echo ""

echo "📋 需要在腾讯云函数控制台更新的环境变量："
echo ""
echo "1. MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0"
echo "2. JWT_SECRET=MyConvenienceStore2024SecretKey!@#\$%RandomString123456789"
echo "3. NODE_ENV=production"
echo ""

echo "🔧 更新步骤："
echo "1. 访问腾讯云函数控制台: https://console.cloud.tencent.com/scf"
echo "2. 找到您的函数并点击进入详情页"
echo "3. 点击'函数配置'标签"
echo "4. 在'环境变量'部分点击'编辑'"
echo "5. 更新或添加上述环境变量"
echo "6. 点击'保存'完成配置"
echo ""

echo "⚠️  重要说明："
echo "- 数据库名称: convenience_store"
echo "- 认证数据库: admin（MongoDB Atlas默认）"
echo "- 连接协议: mongodb+srv（Atlas推荐）"
echo ""

echo "🧪 更新完成后，运行以下命令验证："
echo "./diagnose-mongodb-connection.sh"