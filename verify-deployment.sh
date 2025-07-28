#!/bin/bash

# 便利店进销存系统 - 快速部署验证脚本
# 用于验证部署是否成功

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

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

# 检查 URL 是否可访问
check_url() {
    local url=$1
    local name=$2
    local timeout=30
    
    print_message $BLUE "🔍 检查 $name..."
    
    if curl -s --max-time $timeout "$url" > /dev/null; then
        print_message $GREEN "✅ $name 可访问: $url"
        return 0
    else
        print_message $RED "❌ $name 无法访问: $url"
        return 1
    fi
}

# 检查 API 健康状态
check_api_health() {
    local api_url=$1
    local health_endpoint="$api_url/health"
    
    print_message $BLUE "🏥 检查 API 健康状态..."
    
    local response=$(curl -s --max-time 30 "$health_endpoint" 2>/dev/null || echo "")
    
    if [[ -n "$response" ]]; then
        print_message $GREEN "✅ API 健康检查通过"
        echo "   响应: $response"
        return 0
    else
        print_message $RED "❌ API 健康检查失败"
        return 1
    fi
}

# 检查前端页面
check_frontend() {
    local frontend_url=$1
    
    print_message $BLUE "🌐 检查前端页面..."
    
    local response=$(curl -s --max-time 30 "$frontend_url" 2>/dev/null || echo "")
    
    if [[ "$response" == *"<!DOCTYPE html>"* ]] || [[ "$response" == *"<html"* ]]; then
        print_message $GREEN "✅ 前端页面加载正常"
        return 0
    else
        print_message $RED "❌ 前端页面加载失败"
        return 1
    fi
}

# 主验证函数
main() {
    print_header "部署验证工具"
    
    echo "请输入你的部署地址："
    echo ""
    
    # 获取前端地址
    read -p "前端地址 (例: https://ke-inventory.onrender.com): " frontend_url
    if [[ -z "$frontend_url" ]]; then
        print_message $RED "前端地址不能为空"
        exit 1
    fi
    
    # 获取 API 地址
    read -p "API地址 (例: https://ke-inventory-api.onrender.com): " api_url
    if [[ -z "$api_url" ]]; then
        print_message $RED "API地址不能为空"
        exit 1
    fi
    
    print_header "开始验证部署"
    
    local success_count=0
    local total_checks=3
    
    # 检查前端
    if check_frontend "$frontend_url"; then
        ((success_count++))
    fi
    
    # 检查 API
    if check_url "$api_url" "API 服务"; then
        ((success_count++))
    fi
    
    # 检查 API 健康状态
    if check_api_health "$api_url"; then
        ((success_count++))
    fi
    
    print_header "验证结果"
    
    if [[ $success_count -eq $total_checks ]]; then
        print_message $GREEN "🎉 所有检查都通过了！部署成功！"
        echo ""
        echo "📱 访问地址:"
        echo "   前端: $frontend_url"
        echo "   API: $api_url"
        echo "   健康检查: $api_url/health"
        echo ""
        print_message $CYAN "🎯 下一步可以做的事情:"
        echo "   1. 测试用户注册和登录功能"
        echo "   2. 验证各个业务模块"
        echo "   3. 配置自定义域名（可选）"
        echo "   4. 设置监控和告警"
    else
        print_message $YELLOW "⚠️  部分检查失败 ($success_count/$total_checks)"
        echo ""
        print_message $YELLOW "可能的原因:"
        echo "   1. 服务正在启动中（冷启动需要约50秒）"
        echo "   2. 环境变量配置不正确"
        echo "   3. 数据库连接失败"
        echo "   4. 网络连接问题"
        echo ""
        print_message $CYAN "建议操作:"
        echo "   1. 等待几分钟后重新运行验证"
        echo "   2. 检查 Render Dashboard 中的日志"
        echo "   3. 验证环境变量配置"
        echo "   4. 检查 MongoDB 连接字符串"
    fi
}

# 运行主函数
main "$@"