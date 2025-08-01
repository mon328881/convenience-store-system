#!/bin/bash

echo "🔧 方案2：测试简化版MONGODB_URI"
echo "=================================="

echo ""
echo "📋 当前MONGODB_URI："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0"
echo ""

echo "🎯 方案2 - 简化版MONGODB_URI（去掉appName参数）："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority"
echo ""

echo "💡 请在腾讯云函数中更新MONGODB_URI环境变量为上述简化版本"
echo ""

echo "⏳ 等待30秒让配置生效..."
sleep 30

echo ""
echo "🧪 测试连接..."
response=$(curl -s "https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health")
echo "响应: $response"

if [[ $response == *"success\":true"* ]]; then
    echo "✅ 方案2成功！数据库连接已恢复"
else
    echo "❌ 方案2失败，准备尝试方案3"
    echo ""
    echo "🎯 方案3 - 无数据库名MONGODB_URI："
    echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority"
    echo ""
    echo "💡 请在腾讯云函数中更新MONGODB_URI环境变量为上述版本（去掉数据库名）"
fi