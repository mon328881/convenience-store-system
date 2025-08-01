#!/bin/bash

echo "🔍 腾讯云函数详细诊断脚本"
echo "=========================="
echo "📅 诊断时间: $(date)"
echo ""

# 函数配置
FUNCTION_NAME="inventory-api"
REGION="ap-guangzhou"

echo "🧪 测试1: 基础健康检查"
echo "----------------------"
response=$(curl -s -w "\n状态码: %{http_code}\n响应时间: %{time_total}s\n" \
  "https://service-4k0ap5qy-1259648581.gz.apigw.tencentcs.com/release/health")
echo "响应内容: $response"
echo ""

echo "🧪 测试2: 数据库连接状态检查"
echo "-------------------------"
response=$(curl -s -w "\n状态码: %{http_code}\n响应时间: %{time_total}s\n" \
  "https://service-4k0ap5qy-1259648581.gz.apigw.tencentcs.com/release/api/health")
echo "响应内容: $response"
echo ""

echo "🧪 测试3: 获取详细错误信息"
echo "------------------------"
response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": true}' \
  -w "\n状态码: %{http_code}\n响应时间: %{time_total}s\n" \
  "https://service-4k0ap5qy-1259648581.gz.apigw.tencentcs.com/release/api/products")
echo "响应内容: $response"
echo ""

echo "🧪 测试4: 尝试不同的URI配置"
echo "-------------------------"
echo "本地测试成功的URI配置："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?serverSelectionTimeoutMS=10000&connectTimeoutMS=15000"
echo ""

echo "🔧 建议的解决步骤："
echo "=================="
echo "1. 检查腾讯云函数环境变量配置"
echo "2. 确认MONGODB_URI是否正确设置"
echo "3. 检查函数代码是否为最新版本"
echo "4. 考虑重新部署函数代码"
echo ""

echo "📋 环境变量应该设置为："
echo "MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?serverSelectionTimeoutMS=10000&connectTimeoutMS=15000"
echo "JWT_SECRET=your-secret-key"
echo "NODE_ENV=production"
echo ""

echo "🚀 如果问题持续，请考虑："
echo "1. 重新部署函数代码（使用 inventory-scf-fixed-20250729-120946.zip）"
echo "2. 检查MongoDB Atlas集群状态"
echo "3. 重新生成MongoDB用户密码"
echo ""

echo "📊 诊断完成时间: $(date)"