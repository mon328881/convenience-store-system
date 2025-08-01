#!/bin/bash

echo "🔧 腾讯云函数环境变量深度诊断"
echo "=================================="

echo ""
echo "📋 应该配置的环境变量："
echo "1. MONGODB_URI: mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0"
echo "2. JWT_SECRET: your-super-secret-jwt-key-here-make-it-long-and-random-32chars"
echo "3. NODE_ENV: production"
echo ""

echo "🎯 检查步骤："
echo "1. 登录腾讯云控制台: https://console.cloud.tencent.com/scf"
echo "2. 找到你的云函数 'inventory-api'"
echo "3. 点击函数名称进入详情页"
echo "4. 点击'函数配置'标签"
echo "5. 查看'环境变量'部分"
echo "6. 确认上述三个环境变量都已正确配置"
echo ""

echo "🧪 测试连接..."
response=$(curl -s "https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health")
echo "健康检查响应: $response"

echo ""
echo "🔍 可能的问题："
echo "1. 环境变量未正确设置"
echo "2. 环境变量值有误（特别是MONGODB_URI）"
echo "3. 腾讯云函数代码问题"
echo "4. MongoDB Atlas用户权限问题"
echo ""

echo "💡 建议操作："
echo "1. 重新检查并设置腾讯云函数环境变量"
echo "2. 确保MONGODB_URI完全正确（包括密码、数据库名）"
echo "3. 在腾讯云函数控制台查看详细错误日志"
echo "4. 如果仍然失败，可能需要重新部署函数代码"

echo ""
echo "📞 如果问题持续，请提供："
echo "- 腾讯云函数环境变量配置截图"
echo "- 腾讯云函数详细错误日志"