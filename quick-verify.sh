#!/bin/bash

echo "=== 快速验证脚本 ==="
echo "配置环境变量后，运行此脚本验证结果"
echo ""

URL="https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com"

echo "🔍 测试健康检查接口..."
RESULT=$(curl -s "$URL/api/health")
echo "响应: $RESULT"

if echo "$RESULT" | grep -q '"success":true'; then
    echo "✅ 成功！数据库连接正常"
    echo ""
    echo "🎉 你的腾讯云函数已经完全正常工作！"
    echo "📱 可以开始使用以下API："
    echo "   - 健康检查: $URL/api/health"
    echo "   - 商品管理: $URL/api/products"
    echo "   - 供应商管理: $URL/api/suppliers"
    echo "   - 入库管理: $URL/api/inbound"
    echo "   - 出库管理: $URL/api/outbound"
elif echo "$RESULT" | grep -q "数据库连接失败"; then
    echo "❌ 仍然是数据库连接问题"
    echo "🔧 请检查腾讯云函数的环境变量配置："
    echo "   1. MONGODB_URI 是否正确设置"
    echo "   2. JWT_SECRET 是否已添加"
    echo "   3. NODE_ENV 是否设置为 production"
    echo ""
    echo "📖 详细配置指南: /Users/suizhihao/Trae/ke/腾讯云函数环境变量完整配置.md"
else
    echo "❓ 未知错误，请检查函数日志"
fi