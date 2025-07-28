#!/bin/bash

# 便利店进销存系统 - Render 一键部署脚本
# 版本: 1.0
# 作者: AI Assistant

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo ""
    print_message $CYAN "=================================="
    print_message $CYAN "$1"
    print_message $CYAN "=================================="
    echo ""
}

print_step() {
    print_message $BLUE "🔄 $1"
}

print_success() {
    print_message $GREEN "✅ $1"
}

print_warning() {
    print_message $YELLOW "⚠️  $1"
}

print_error() {
    print_message $RED "❌ $1"
}

# 检查必要的工具
check_prerequisites() {
    print_header "检查部署环境"
    
    # 检查 Git
    if ! command -v git &> /dev/null; then
        print_error "Git 未安装，请先安装 Git"
        exit 1
    fi
    print_success "Git 已安装"
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    print_success "Node.js 已安装 ($(node --version))"
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    print_success "npm 已安装 ($(npm --version))"
    
    # 检查是否在正确的目录
    if [[ ! -f "render.yaml" ]]; then
        print_error "未找到 render.yaml 文件，请确保在项目根目录运行此脚本"
        exit 1
    fi
    print_success "项目配置文件检查通过"
}

# 检查项目结构
check_project_structure() {
    print_header "检查项目结构"
    
    local required_files=(
        "api/package.json"
        "api/index.js"
        "frontend/package.json"
        "frontend/src/main.js"
        "render.yaml"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "缺少必要文件: $file"
            exit 1
        fi
    done
    print_success "项目结构检查通过"
}

# 安装依赖
install_dependencies() {
    print_header "安装项目依赖"
    
    # 安装后端依赖
    print_step "安装后端依赖..."
    cd api
    npm install --production
    cd ..
    print_success "后端依赖安装完成"
    
    # 安装前端依赖
    print_step "安装前端依赖..."
    cd frontend
    npm install
    cd ..
    print_success "前端依赖安装完成"
}

# 构建前端
build_frontend() {
    print_header "构建前端应用"
    
    print_step "开始构建前端..."
    cd frontend
    npm run build
    cd ..
    
    if [[ -d "frontend/dist" ]]; then
        print_success "前端构建完成"
    else
        print_error "前端构建失败"
        exit 1
    fi
}

# 检查 Git 状态
check_git_status() {
    print_header "检查 Git 状态"
    
    # 检查是否有远程仓库
    if ! git remote -v | grep -q origin; then
        print_error "未配置远程仓库，请先添加远程仓库:"
        echo "git remote add origin <你的仓库地址>"
        exit 1
    fi
    print_success "远程仓库配置正确"
    
    # 检查是否有未提交的更改
    if [[ -n $(git status --porcelain) ]]; then
        print_warning "发现未提交的更改"
        read -p "是否自动提交所有更改? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "自动提交: 准备 Render 部署 $(date '+%Y-%m-%d %H:%M:%S')"
            print_success "更改已自动提交"
        else
            print_error "请手动提交更改后再运行部署脚本"
            exit 1
        fi
    else
        print_success "Git 状态检查通过"
    fi
}

# 推送代码
push_code() {
    print_header "推送代码到远程仓库"
    
    print_step "推送到远程仓库..."
    
    # 尝试推送到 main 分支
    if git push origin main 2>/dev/null; then
        print_success "代码已推送到 main 分支"
    # 如果失败，尝试推送到 master 分支
    elif git push origin master 2>/dev/null; then
        print_success "代码已推送到 master 分支"
    else
        print_error "代码推送失败，请检查网络连接和仓库权限"
        exit 1
    fi
}

# 生成环境变量模板
generate_env_template() {
    print_header "生成环境变量配置"
    
    cat > .env.render << EOF
# Render 部署环境变量配置
# 请在 Render Dashboard 中配置以下环境变量

# 后端 API 服务环境变量 (ke-inventory-api)
NODE_ENV=production
MONGODB_URI=mongodb+srv://用户名:密码@cluster.mongodb.net/convenience_store?retryWrites=true&w=majority
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "请手动生成32位随机字符串")

# 前端静态网站环境变量 (ke-inventory-frontend)
VITE_API_URL=https://ke-inventory-api.onrender.com

# 注意事项:
# 1. MONGODB_URI 需要替换为你的 MongoDB Atlas 连接字符串
# 2. JWT_SECRET 已自动生成，也可以手动替换
# 3. 域名会在部署后自动分配，可能与上述不同
EOF
    
    print_success "环境变量模板已生成: .env.render"
}

# 显示部署信息
show_deployment_info() {
    print_header "部署信息"
    
    echo "🎯 项目信息:"
    echo "   - 项目名称: 便利店进销存系统"
    echo "   - 前端技术: Vue.js + Element Plus"
    echo "   - 后端技术: Express.js + MongoDB"
    echo "   - 部署平台: Render"
    echo ""
    
    echo "📦 服务配置:"
    echo "   - 后端 API: ke-inventory-api (Node.js)"
    echo "   - 前端网站: ke-inventory-frontend (Static)"
    echo "   - 数据库: ke-inventory-db (PostgreSQL)"
    echo ""
    
    echo "💰 成本信息:"
    echo "   - 所有服务使用免费层级"
    echo "   - Web Service: 750小时/月"
    echo "   - Static Site: 无限制"
    echo "   - 数据库: 1GB 存储"
    echo ""
    
    print_warning "免费层级限制:"
    echo "   - 15分钟无活动后自动休眠"
    echo "   - 冷启动需要约50秒"
    echo "   - 每月750小时使用时间"
}

# 显示下一步操作
show_next_steps() {
    print_header "下一步操作指南"
    
    echo "🌐 访问 Render 控制台:"
    echo "   1. 打开浏览器访问: https://render.com"
    echo "   2. 使用 GitHub 账号登录"
    echo ""
    
    echo "🚀 开始部署 (推荐方式):"
    echo "   1. 点击 'New' 按钮"
    echo "   2. 选择 'Blueprint'"
    echo "   3. 连接你的 GitHub 仓库"
    echo "   4. 选择此项目仓库"
    echo "   5. Render 会自动读取 render.yaml 配置"
    echo "   6. 配置环境变量 (参考 .env.render 文件)"
    echo "   7. 点击 'Create Blueprint' 开始部署"
    echo ""
    
    echo "🔧 环境变量配置:"
    echo "   - 在服务创建过程中配置环境变量"
    echo "   - 参考生成的 .env.render 文件"
    echo "   - 特别注意配置 MONGODB_URI"
    echo ""
    
    echo "📱 部署完成后:"
    echo "   - 前端地址: https://ke-inventory.onrender.com"
    echo "   - API地址: https://ke-inventory-api.onrender.com"
    echo "   - 健康检查: https://ke-inventory-api.onrender.com/health"
    echo ""
    
    echo "📚 相关文档:"
    echo "   - Render部署指南.md - 详细部署步骤"
    echo "   - Render环境变量配置清单.md - 环境变量说明"
    echo "   - MongoDB Atlas配置指南.md - 数据库配置"
    echo ""
    
    print_warning "重要提醒:"
    echo "   1. 确保 MongoDB Atlas 允许来自任何 IP 的连接"
    echo "   2. 部署后需要等待服务启动 (约2-5分钟)"
    echo "   3. 首次访问可能需要等待冷启动"
    echo "   4. 免费层级有使用时间限制"
}

# 主函数
main() {
    clear
    print_header "便利店进销存系统 - Render 一键部署"
    
    echo "此脚本将帮助你完成以下操作:"
    echo "✓ 检查部署环境"
    echo "✓ 验证项目结构"
    echo "✓ 安装项目依赖"
    echo "✓ 构建前端应用"
    echo "✓ 检查 Git 状态"
    echo "✓ 推送代码到远程仓库"
    echo "✓ 生成环境变量配置"
    echo "✓ 提供详细的部署指南"
    echo ""
    
    read -p "是否继续执行一键部署? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_message $YELLOW "部署已取消"
        exit 0
    fi
    
    # 执行部署步骤
    check_prerequisites
    check_project_structure
    install_dependencies
    build_frontend
    check_git_status
    push_code
    generate_env_template
    show_deployment_info
    show_next_steps
    
    print_header "部署准备完成"
    print_success "所有准备工作已完成！"
    print_message $CYAN "请按照上述指南在 Render 控制台完成最终部署。"
    echo ""
    print_message $PURPLE "🎉 祝你部署顺利！"
}

# 运行主函数
main "$@"