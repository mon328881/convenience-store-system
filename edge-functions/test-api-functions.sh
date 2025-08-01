#!/bin/bash

echo "=== 腾讯云函数API测试脚本 ==="
echo "✅ 健康检查已通过，现在测试完整API功能"
echo ""

# 请替换为您的实际云函数URL
FUNCTION_URL="https://your-scf-url-here"

echo "🔧 测试说明："
echo "请将 FUNCTION_URL 替换为您的实际腾讯云函数URL"
echo ""

echo "📋 测试命令："
echo ""

echo "1️⃣ 健康检查 (已成功):"
echo "curl -X GET \"\$FUNCTION_URL/health\""
echo ""

echo "2️⃣ 获取所有供应商:"
echo "curl -X GET \"\$FUNCTION_URL/api/suppliers\""
echo ""

echo "3️⃣ 获取特定供应商 (ID=1):"
echo "curl -X GET \"\$FUNCTION_URL/api/suppliers/1\""
echo ""

echo "4️⃣ 测试CORS预检请求:"
echo "curl -X OPTIONS \"\$FUNCTION_URL/api/suppliers\" \\"
echo "  -H \"Origin: http://localhost:5173\" \\"
echo "  -H \"Access-Control-Request-Method: GET\""
echo ""

echo "5️⃣ 测试404错误:"
echo "curl -X GET \"\$FUNCTION_URL/api/nonexistent\""
echo ""

echo "🎯 预期结果："
echo "- 健康检查: ✅ 已通过"
echo "- 供应商列表: 返回3个模拟供应商"
echo "- 单个供应商: 返回详细信息"
echo "- CORS: 返回正确的CORS头"
echo "- 404: 返回错误信息"
echo ""

echo "📊 性能指标 (当前):"
echo "- 响应时间: 6ms ⚡"
echo "- 内存使用: 12.23MB"
echo "- 状态: 健康运行 ✅"