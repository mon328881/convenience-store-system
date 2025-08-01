#!/bin/bash

# EdgeOne Pages 前端更新脚本
# 用于更新API地址并重新部署

echo "=== EdgeOne Pages 前端更新脚本 ==="
echo "请先完成腾讯云函数部署，然后运行此脚本"
echo ""

# 提示用户输入函数URL
read -p "请输入您的腾讯云函数URL地址: " FUNCTION_URL

if [ -z "$FUNCTION_URL" ]; then
    echo "❌ 错误：函数URL不能为空"
    exit 1
fi

# 验证URL格式
if [[ ! $FUNCTION_URL =~ ^https:// ]]; then
    echo "❌ 错误：URL必须以https://开头"
    exit 1
fi

echo "📝 更新前端环境变量..."

# 更新前端环境变量文件
cat > frontend/.env.edgeone << EOF
# EdgeOne前端环境变量配置

# 部署方案类型
VITE_DEPLOYMENT_TYPE=edgeone

# 腾讯云函数URL地址
VITE_EDGEONE_API_URL=$FUNCTION_URL

# 腾讯云轻量应用服务器API地址（备用方案）
VITE_TENCENT_API_URL=https://your-server-ip/api

# Render平台API地址（备用方案）
VITE_API_URL=https://your-app.onrender.com/api

# 应用配置
VITE_APP_NAME=库存管理系统
VITE_APP_VERSION=1.0.0

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEBUG=false
EOF

echo "✅ 环境变量已更新"
echo ""
echo "📋 EdgeOne Pages 环境变量配置："
echo "VITE_DEPLOYMENT_TYPE=edgeone"
echo "VITE_EDGEONE_API_URL=$FUNCTION_URL"
echo "VITE_APP_NAME=库存管理系统"
echo "VITE_ENABLE_MOCK=false"
echo ""
echo "🚀 下一步操作："
echo "1. 在EdgeOne Pages项目设置中添加上述环境变量"
echo "2. 重新部署前端项目"
echo "3. 等待构建完成"
echo ""
echo "🔗 测试链接："
echo "后端API: $FUNCTION_URL/api/health"
echo "前端页面: https://convenience-store-system-kkfcho8uu7.edgeone.run/"
echo ""
echo "✅ 配置完成！"