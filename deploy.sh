#!/bin/bash

# 便利店进销存系统 - 快速发布脚本
echo "🚀 开始发布便利店进销存系统..."

# 检查是否已经配置了Git用户信息
if ! git config user.name > /dev/null 2>&1; then
    echo "⚠️  请先配置Git用户信息："
    echo "git config --global user.name \"你的用户名\""
    echo "git config --global user.email \"你的邮箱\""
    exit 1
fi

# 检查是否有未提交的更改
if ! git diff --quiet; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    git commit -m "更新项目文件 - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 检查是否已经添加了远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ 请先添加GitHub远程仓库："
    echo "git remote add origin https://github.com/你的用户名/convenience-store-system.git"
    echo ""
    echo "📋 GitHub仓库创建步骤："
    echo "1. 访问 https://github.com"
    echo "2. 点击右上角 '+' -> 'New repository'"
    echo "3. 仓库名: convenience-store-system"
    echo "4. 描述: 便利店进销存管理系统"
    echo "5. 选择 Public"
    echo "6. 不要勾选 'Initialize this repository with a README'"
    echo "7. 点击 'Create repository'"
    exit 1
fi

# 推送到GitHub
echo "📤 推送代码到GitHub..."
git push -u origin main || git push -u origin master

echo "✅ 代码已成功推送到GitHub!"
echo ""
echo "🌐 下一步 - 部署到Vercel："
echo "1. 访问 https://vercel.com"
echo "2. 使用GitHub账号登录"
echo "3. 点击 'New Project'"
echo "4. 选择你的 convenience-store-system 仓库"
echo "5. 配置构建设置："
echo "   - Build Command: npm run vercel-build"
echo "   - Output Directory: frontend/dist"
echo "6. 添加环境变量："
echo "   - MONGODB_URI: 你的MongoDB连接字符串"
echo "   - JWT_SECRET: 随机生成的密钥"
echo "   - NODE_ENV: production"
echo "7. 点击 'Deploy'"
echo ""
echo "📚 详细部署指南请查看: 部署指南.md"
echo "🎉 完成后你的系统就可以在线访问了！"