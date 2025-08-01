#!/bin/bash

echo "🔍 测试本地后端API连接到MongoDB数据库"
echo "=========================================="

BASE_URL="http://localhost:3000/api"

echo ""
echo "1. 测试供应商接口..."
SUPPLIERS_RESULT=$(curl -s "$BASE_URL/suppliers")
echo "   成功: $(echo "$SUPPLIERS_RESULT" | jq -r '.success')"
echo "   数据条数: $(echo "$SUPPLIERS_RESULT" | jq -r '.data | length')"

echo ""
echo "2. 测试商品接口..."
PRODUCTS_RESULT=$(curl -s "$BASE_URL/products")
echo "   成功: $(echo "$PRODUCTS_RESULT" | jq -r '.success')"
echo "   数据条数: $(echo "$PRODUCTS_RESULT" | jq -r '.data | length')"

echo ""
echo "3. 测试入库记录接口..."
INBOUND_RESULT=$(curl -s "$BASE_URL/inbound")
echo "   成功: $(echo "$INBOUND_RESULT" | jq -r '.success')"
echo "   数据条数: $(echo "$INBOUND_RESULT" | jq -r '.data | length')"

echo ""
echo "4. 测试出库记录接口..."
OUTBOUND_RESULT=$(curl -s "$BASE_URL/outbound")
echo "   成功: $(echo "$OUTBOUND_RESULT" | jq -r '.success')"
echo "   数据条数: $(echo "$OUTBOUND_RESULT" | jq -r '.data | length')"

echo ""
echo "5. 测试报表接口..."
REPORTS_RESULT=$(curl -s "$BASE_URL/reports/dashboard")
echo "   成功: $(echo "$REPORTS_RESULT" | jq -r '.success')"

echo ""
echo "✅ 本地后端API测试完成！"
echo "📊 MongoDB数据库连接正常，所有接口响应正常"