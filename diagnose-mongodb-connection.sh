#!/bin/bash

echo "=== 腾讯云函数MongoDB连接详细诊断 ==="
echo ""

FIXED_IP="175.178.229.42"
SCF_URL="https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com"

echo "🔍 固定IP: $FIXED_IP"
echo "📡 函数URL: $SCF_URL"
echo ""

# 测试1: 基础连接测试
echo "📋 测试1: 基础连接测试"
echo "请求: GET $SCF_URL"
BASIC_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$SCF_URL")
BASIC_STATUS=$(echo $BASIC_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BASIC_BODY=$(echo $BASIC_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "状态码: $BASIC_STATUS"
echo "响应: $BASIC_BODY"
echo ""

# 测试2: 健康检查详细测试
echo "📋 测试2: 健康检查详细测试"
echo "请求: GET $SCF_URL/api/health"
HEALTH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$SCF_URL/api/health")
HEALTH_STATUS=$(echo $HEALTH_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
HEALTH_BODY=$(echo $HEALTH_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "状态码: $HEALTH_STATUS"
echo "响应: $HEALTH_BODY"
echo ""

# 测试3: 数据库连接测试
echo "📋 测试3: 数据库连接测试"
echo "请求: GET $SCF_URL/api/products"
PRODUCTS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$SCF_URL/api/products")
PRODUCTS_STATUS=$(echo $PRODUCTS_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
PRODUCTS_BODY=$(echo $PRODUCTS_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "状态码: $PRODUCTS_STATUS"
echo "响应: $PRODUCTS_BODY"
echo ""

# 分析结果
echo "🔍 诊断分析:"
echo ""

if [ "$HEALTH_STATUS" = "200" ] && echo "$HEALTH_BODY" | grep -q '"success":true'; then
    echo "✅ 数据库连接成功！"
    echo "   - 固定IP配置正确"
    echo "   - MongoDB Atlas白名单配置正确"
    echo "   - 环境变量配置正确"
elif [ "$HEALTH_STATUS" = "500" ] && echo "$HEALTH_BODY" | grep -q "数据库连接失败"; then
    echo "❌ 数据库连接失败，可能原因："
    echo ""
    echo "1. 🕐 MongoDB Atlas白名单配置需要时间生效（等待5-10分钟）"
    echo "2. 🔑 腾讯云函数环境变量配置问题："
    echo "   - MONGODB_URI 可能未正确配置"
    echo "   - JWT_SECRET 可能缺失"
    echo "   - NODE_ENV 可能未设置为 production"
    echo ""
    echo "3. 🌐 网络连接问题："
    echo "   - 检查MongoDB Atlas集群状态"
    echo "   - 验证连接字符串格式"
    echo ""
    echo "📋 建议操作："
    echo "1. 等待5-10分钟让白名单配置生效"
    echo "2. 检查腾讯云函数控制台的环境变量配置"
    echo "3. 确认MongoDB Atlas集群正在运行"
elif [ "$HEALTH_STATUS" = "000" ]; then
    echo "❌ 网络连接失败"
    echo "   - 检查函数URL是否正确"
    echo "   - 检查腾讯云函数是否正在运行"
else
    echo "❌ 未知错误，状态码: $HEALTH_STATUS"
    echo "   - 检查腾讯云函数日志"
    echo "   - 验证函数部署状态"
fi

echo ""
echo "🔧 快速修复建议："
echo ""
echo "如果是环境变量问题，请检查腾讯云函数控制台中的环境变量："
echo "1. MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
echo "2. JWT_SECRET=MyConvenienceStore2024SecretKey!@#\$%RandomString123456789"
echo "3. NODE_ENV=production"
echo ""
echo "📖 详细指南:"
echo "   环境变量配置: /Users/suizhihao/Trae/ke/腾讯云函数环境变量完整配置.md"