#!/bin/bash

echo "🧪 MongoDB连接验证脚本"
echo "======================"

echo ""
echo "⏳ 等待配置生效（60秒）..."
sleep 60

echo ""
echo "🔍 测试连接状态..."
response=$(curl -s "https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health")
echo "响应: $response"

echo ""
if [[ $response == *"success\":true"* ]]; then
    echo "✅ 成功！数据库连接已恢复"
    echo "🎉 可以继续使用系统了"
elif [[ $response == *"数据库连接失败"* ]]; then
    echo "❌ 仍然失败，请尝试下一个方案"
    echo ""
    echo "🔧 如果这是："
    echo "- 方案2测试：请尝试方案3（无数据库名）"
    echo "- 方案3测试：请尝试方案4（最简版）"
    echo "- 方案4测试：请考虑重新生成MongoDB密码"
else
    echo "⚠️  未知响应，请检查函数状态"
fi

echo ""
echo "📊 测试完成时间: $(date)"