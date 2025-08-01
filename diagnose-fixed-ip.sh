#!/bin/bash

echo "=== 腾讯云函数固定IP诊断脚本 ==="
echo ""

# 获取腾讯云函数的实际出口IP
echo "🔍 检查腾讯云函数的实际出口IP..."
echo "调用腾讯云函数获取其出口IP地址..."

# 从环境变量文件读取函数URL
if [ -f ".env" ]; then
    source .env
elif [ -f ".env.example" ]; then
    echo "⚠️  未找到.env文件，使用.env.example作为参考"
    source .env.example
fi

# 检查是否有腾讯云函数URL
if [ -z "$SCF_URL" ]; then
    echo "❌ 未找到SCF_URL环境变量"
    echo "请在.env文件中设置您的腾讯云函数URL"
    echo "格式: SCF_URL=https://your-function-url"
    exit 1
fi

echo "📡 腾讯云函数URL: $SCF_URL"
echo ""

# 创建一个特殊的端点来获取函数的出口IP
echo "🌐 尝试获取函数的出口IP地址..."
IP_RESPONSE=$(curl -s -X GET "$SCF_URL/api/get-ip" 2>/dev/null || echo "failed")

if [ "$IP_RESPONSE" = "failed" ]; then
    echo "❌ 无法获取函数出口IP，可能需要添加IP检测端点"
    echo ""
    echo "🔧 建议操作："
    echo "1. 确认腾讯云函数已启用固定公网出口IP"
    echo "2. 在腾讯云控制台查看分配的固定IP地址"
    echo "3. 将该IP地址添加到MongoDB Atlas白名单"
    echo ""
else
    echo "📍 函数出口IP: $IP_RESPONSE"
    echo ""
fi

# 测试数据库连接
echo "🔍 测试数据库连接..."
DB_RESPONSE=$(curl -s -X GET "$SCF_URL/api/health" 2>/dev/null || echo '{"success":false,"error":"请求失败"}')
echo "数据库连接测试结果: $DB_RESPONSE"
echo ""

# 解析响应
if echo "$DB_RESPONSE" | grep -q '"success":true'; then
    echo "✅ 数据库连接成功！"
    echo "🎉 问题已解决"
elif echo "$DB_RESPONSE" | grep -q "数据库连接失败"; then
    echo "❌ 数据库连接仍然失败"
    echo ""
    echo "🔧 可能的原因："
    echo "1. 腾讯云函数的固定IP未添加到MongoDB Atlas白名单"
    echo "2. MongoDB Atlas白名单更新需要时间生效"
    echo "3. 环境变量MONGODB_URI配置问题"
    echo ""
    echo "📋 检查清单："
    echo "□ 腾讯云控制台确认已启用固定公网出口IP"
    echo "□ 记录分配的固定IP地址"
    echo "□ MongoDB Atlas > Security > Network Access"
    echo "□ 添加腾讯云函数的固定IP到白名单"
    echo "□ 等待白名单状态变为Active"
    echo "□ 重新测试连接"
else
    echo "⚠️  收到意外响应，可能存在其他问题"
fi

echo ""
echo "📖 详细配置指南:"
echo "   - 腾讯云函数固定IP配置: /Users/suizhihao/Trae/ke/腾讯云函数固定IP配置指南.md"
echo "   - MongoDB Atlas配置: /Users/suizhihao/Trae/ke/MongoDB Atlas配置指南.md"