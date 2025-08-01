#!/bin/bash

echo "🔧 腾讯云函数代码修复和重新部署"
echo "=================================="

echo ""
echo "📋 问题分析："
echo "错误信息显示腾讯云函数代码有语法错误："
echo "- 文件: /usr/local/var/functions/.../src/index.js"
echo "- 错误: 应为\";\"。"
echo "- 这表明函数代码需要重新部署"
echo ""

echo "🎯 解决方案："
echo "1. 重新打包函数代码"
echo "2. 上传到腾讯云函数"
echo "3. 更新环境变量"
echo "4. 测试连接"
echo ""

echo "📦 开始重新打包..."
cd /Users/suizhihao/Trae/ke/edge-functions/scf-deploy

# 检查必要文件
if [ ! -f "index.js" ]; then
    echo "❌ index.js 文件不存在"
    exit 1
fi

if [ ! -f "app.js" ]; then
    echo "❌ app.js 文件不存在"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json 文件不存在"
    exit 1
fi

echo "✅ 所有必要文件存在"

# 创建新的部署包
echo "📦 创建部署包..."
zip -r inventory-scf-fixed-$(date +%Y%m%d-%H%M%S).zip . -x "*.zip" "*.md" "test-*" "diagnostic-*"

echo ""
echo "✅ 部署包创建完成"
echo ""

echo "📝 下一步操作："
echo "1. 登录腾讯云控制台"
echo "2. 进入云函数 -> inventory-api"
echo "3. 点击'函数代码'标签"
echo "4. 选择'上传zip包'"
echo "5. 上传刚创建的zip文件"
echo "6. 确认环境变量配置："
echo "   - MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/"
echo "   - JWT_SECRET=MyConvenienceStore2024SecretKey!@#\$%RandomString123456789"
echo "   - NODE_ENV=production"
echo "7. 保存并部署"
echo ""

echo "🧪 部署完成后运行测试："
echo "cd /Users/suizhihao/Trae/ke && ./verify-mongodb-connection.sh"