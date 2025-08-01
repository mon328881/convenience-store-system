#!/bin/bash

echo "=== 腾讯云函数URL测试脚本 ==="
echo ""

# 检查是否提供了URL参数
if [ -z "$1" ]; then
    echo "❌ 请提供腾讯云函数URL"
    echo "用法: ./test-scf-url.sh <函数URL>"
    echo ""
    echo "示例:"
    echo "  ./test-scf-url.sh https://service-xxxxxxxx-xxxxxxxxx.gz.apigw.tencentcs.com"
    echo ""
    echo "📋 如何获取函数URL:"
    echo "1. 访问: https://console.cloud.tencent.com/scf"
    echo "2. 找到你的函数 (如: inventory-api)"
    echo "3. 点击函数名进入详情页"
    echo "4. 查看'触发器管理'标签"
    echo "5. 复制函数URL地址"
    exit 1
fi

FUNCTION_URL="$1"
echo "🔍 测试函数URL: $FUNCTION_URL"
echo ""

# 测试1: 根路径
echo "📡 测试1: 根路径访问"
echo "请求: GET $FUNCTION_URL"
curl -X GET "$FUNCTION_URL" \
    -H "Content-Type: application/json" \
    -w "\n状态码: %{http_code} | 响应时间: %{time_total}s\n" \
    -s --max-time 30
echo ""

# 测试2: 健康检查
echo "📡 测试2: 健康检查接口"
echo "请求: GET $FUNCTION_URL/api/health"
curl -X GET "$FUNCTION_URL/api/health" \
    -H "Content-Type: application/json" \
    -w "\n状态码: %{http_code} | 响应时间: %{time_total}s\n" \
    -s --max-time 30
echo ""

# 测试3: 商品接口
echo "📡 测试3: 商品列表接口"
echo "请求: GET $FUNCTION_URL/api/products"
curl -X GET "$FUNCTION_URL/api/products" \
    -H "Content-Type: application/json" \
    -w "\n状态码: %{http_code} | 响应时间: %{time_total}s\n" \
    -s --max-time 30
echo ""

# 测试4: 供应商接口
echo "📡 测试4: 供应商列表接口"
echo "请求: GET $FUNCTION_URL/api/suppliers"
curl -X GET "$FUNCTION_URL/api/suppliers" \
    -H "Content-Type: application/json" \
    -w "\n状态码: %{http_code} | 响应时间: %{time_total}s\n" \
    -s --max-time 30
echo ""

echo "✅ 测试完成！"
echo ""
echo "📋 结果分析:"
echo "- 状态码 200: 成功"
echo "- 状态码 500: 服务器错误（通常是数据库连接问题）"
echo "- 状态码 000: 网络连接失败（URL无效或网络问题）"
echo ""
echo "🔧 如果所有接口都返回500且错误信息是'数据库连接失败':"
echo "   说明函数运行正常，但需要配置MongoDB连接"
echo "   请检查腾讯云函数的环境变量配置"
echo ""
echo "📖 详细配置指南:"
echo "   /Users/suizhihao/Trae/ke/腾讯云函数环境变量完整配置.md"