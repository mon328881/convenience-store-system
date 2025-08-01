#!/bin/bash

# Vercel 部署脚本 - 简化版
# 用于便利店进销存系统的自动化部署（仅前端静态文件）

echo "🚀 开始部署便利店进销存系统到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录 Vercel
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "📝 请登录 Vercel..."
    vercel login
fi

# 构建前端项目
echo "🔨 构建前端项目..."
cd frontend

# 使用Vercel专用环境变量
echo "📝 配置Vercel环境变量..."
cp .env.vercel .env

npm install
npm run build
cd ..

# 检查构建是否成功
if [ ! -d "frontend/dist" ]; then
    echo "❌ 前端构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 前端构建成功"

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

echo "🎉 部署完成！"
echo ""
echo "📋 部署后检查清单："
echo "1. 访问你的 Vercel 应用 URL"
echo "2. 检查前端页面是否正常加载"
echo "3. 测试数据库连接是否正常（直连Supabase）"
echo "4. 确认所有功能是否正常工作"
echo ""
echo "🔧 如果遇到问题，请检查："
echo "1. Supabase连接配置是否正确"
echo "2. 前端环境变量是否正确设置"
echo "3. 查看 Vercel 部署日志"