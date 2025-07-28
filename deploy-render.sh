# Render 快速部署脚本

# 检查是否已安装 git
if ! command -v git &> /dev/null; then
    echo "错误: 请先安装 Git"
    exit 1
fi

echo "🚀 开始准备 Render 部署..."

# 1. 确保代码已提交
echo "📝 检查 Git 状态..."
if [[ -n $(git status --porcelain) ]]; then
    echo "发现未提交的更改，正在提交..."
    git add .
    git commit -m "准备 Render 部署配置"
fi

# 2. 推送到远程仓库
echo "📤 推送代码到远程仓库..."
git push origin main || git push origin master

# 3. 显示部署信息
echo ""
echo "✅ 代码已准备完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 访问 https://render.com"
echo "2. 使用 GitHub 账号登录"
echo "3. 选择以下部署方式之一："
echo ""
echo "🔥 方式一：Blueprint 一键部署（推荐）"
echo "   - 点击 'New' → 'Blueprint'"
echo "   - 选择你的 GitHub 仓库"
echo "   - Render 会自动读取 render.yaml 配置"
echo "   - 配置环境变量后点击 'Create Blueprint'"
echo ""
echo "⚙️  方式二：手动分别部署"
echo "   - 参考 'Render部署指南.md' 文档"
echo "   - 分别创建 Web Service 和 Static Site"
echo ""
echo "🔧 需要配置的环境变量："
echo "   - MONGODB_URI: 你的 MongoDB 连接字符串"
echo "   - JWT_SECRET: 32位随机字符串"
echo "   - NODE_ENV: production"
echo ""
echo "📖 详细说明请查看: Render部署指南.md"
echo ""
echo "🎉 部署完成后，你将获得："
echo "   - 前端地址: https://你的应用名.onrender.com"
echo "   - API地址: https://你的API名.onrender.com"
echo ""
echo "⚠️  注意: 免费层级有15分钟无活动休眠限制"