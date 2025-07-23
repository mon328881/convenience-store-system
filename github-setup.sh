#!/bin/bash

echo "🚀 正在配置 GitHub 仓库..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 添加所有文件
echo "📁 添加所有文件到 Git..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "完整的便利店进销存系统 - 包含前端、后端和部署配置"

# 设置远程仓库（请替换为你的 GitHub 用户名）
echo "🔗 设置远程仓库..."
echo "请将下面的命令中的 'YOUR_USERNAME' 替换为你的 GitHub 用户名："
echo "git remote add origin https://github.com/YOUR_USERNAME/convenience-store-system.git"
echo ""
echo "然后运行："
echo "git push -u origin main"
echo ""
echo "✅ 配置完成！请按照上面的提示完成最后步骤。"