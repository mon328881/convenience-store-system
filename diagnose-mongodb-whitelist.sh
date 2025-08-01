#!/bin/bash

echo "🔍 MongoDB Atlas 白名单诊断工具"
echo "=================================="

echo ""
echo "📋 当前配置信息："
echo "- 腾讯云函数固定IP: 175.178.229.42"
echo "- MongoDB集群: cluster0.b4d7wmh.mongodb.net"
echo "- 数据库名: convenience_store"
echo ""

echo "🎯 需要在MongoDB Atlas中配置的白名单："
echo "1. 登录 https://cloud.mongodb.com"
echo "2. 进入 Security → Network Access"
echo "3. 点击 'Add IP Address'"
echo "4. 添加IP: 175.178.229.42/32"
echo "5. 注释: 腾讯云函数固定IP"
echo "6. 点击 Confirm"
echo ""

echo "⚠️  如果上述IP不工作，可以临时使用："
echo "- IP地址: 0.0.0.0/0"
echo "- 注释: 临时允许所有IP（仅用于测试）"
echo ""

echo "🧪 测试当前连接状态..."
echo "正在调用腾讯云函数..."

# 测试健康检查接口
response=$(curl -s "https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health")
echo "响应: $response"

if echo "$response" | grep -q '"success":true'; then
    echo "✅ 连接成功！"
else
    echo "❌ 连接失败"
    echo ""
    echo "🔧 解决步骤："
    echo "1. 确认已在MongoDB Atlas添加IP: 175.178.229.42"
    echo "2. 等待白名单状态变为 'Active'"
    echo "3. 如果仍然失败，临时使用 0.0.0.0/0"
    echo "4. 检查腾讯云函数环境变量是否正确配置"
fi

echo ""
echo "📖 详细配置指南:"
echo "- MongoDB Atlas: /Users/suizhihao/Trae/ke/MongoDB Atlas配置指南.md"
echo "- 腾讯云函数: /Users/suizhihao/Trae/ke/腾讯云函数环境变量完整配置.md"