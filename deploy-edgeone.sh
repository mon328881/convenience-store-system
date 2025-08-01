#!/bin/bash

# 腾讯云EdgeOne前端部署脚本
# 用于将前端项目部署到腾讯云EdgeOne Pages

echo "🚀 腾讯云EdgeOne前端部署脚本"
echo "================================"

# 检查是否已构建
if [ ! -d "frontend/dist" ]; then
    echo "❌ 错误：未找到构建文件，请先运行构建命令"
    echo "   cd frontend && npm run build"
    exit 1
fi

echo "✅ 检测到构建文件"

# 显示构建信息
echo ""
echo "📦 构建信息："
echo "构建目录: frontend/dist"
echo "文件数量: $(find frontend/dist -type f | wc -l)"
echo "总大小: $(du -sh frontend/dist | cut -f1)"

# 检查关键文件
echo ""
echo "🔍 检查关键文件："
if [ -f "frontend/dist/index.html" ]; then
    echo "✅ index.html 存在"
else
    echo "❌ index.html 不存在"
    exit 1
fi

if [ -d "frontend/dist/assets" ]; then
    echo "✅ assets 目录存在"
    echo "   JS文件: $(find frontend/dist/assets -name "*.js" | wc -l) 个"
    echo "   CSS文件: $(find frontend/dist/assets -name "*.css" | wc -l) 个"
else
    echo "❌ assets 目录不存在"
    exit 1
fi

# 创建部署包
echo ""
echo "📦 创建部署包..."
cd frontend/dist

# 创建压缩包
tar -czf ../../edgeone-deploy.tar.gz .
cd ../..

echo "✅ 部署包已创建: edgeone-deploy.tar.gz"
echo "   大小: $(du -sh edgeone-deploy.tar.gz | cut -f1)"

echo ""
echo "🌐 腾讯云EdgeOne部署步骤："
echo "================================"
echo ""
echo "1. 登录腾讯云EdgeOne控制台"
echo "   https://console.cloud.tencent.com/edgeone"
echo ""
echo "2. 选择或创建站点"
echo "   - 如果没有站点，点击「添加站点」"
echo "   - 输入您的域名（如：example.com）"
echo "   - 选择「免费版」套餐"
echo ""
echo "3. 进入Pages服务"
echo "   - 在左侧菜单选择「Pages」"
echo "   - 点击「创建项目」"
echo ""
echo "4. 配置项目"
echo "   项目名称: convenience-store-frontend"
echo "   部署方式: 选择「上传文件」"
echo ""
echo "5. 上传构建文件"
echo "   - 上传刚创建的 edgeone-deploy.tar.gz"
echo "   - 或者直接上传 frontend/dist 目录下的所有文件"
echo ""
echo "6. 配置环境变量（重要！）"
echo "   在项目设置中添加以下环境变量："
echo "   VITE_DEPLOYMENT_TYPE=edgeone"
echo "   VITE_EDGEONE_API_URL=https://1371559131-0yd2evf4vy.ap-beijing.tencentscf.com"
echo "   VITE_APP_NAME=库存管理系统"
echo "   VITE_ENABLE_MOCK=false"
echo ""
echo "7. 部署设置"
echo "   构建命令: npm run build"
echo "   输出目录: dist"
echo "   Node.js版本: 18.x"
echo ""
echo "8. 完成部署"
echo "   - 点击「部署」按钮"
echo "   - 等待构建和部署完成"
echo "   - 获取访问URL"
echo ""
echo "🔗 预期访问地址："
echo "https://your-project.edgeone.app"
echo ""
echo "🧪 部署后测试："
echo "1. 访问前端页面，检查是否正常加载"
echo "2. 测试登录功能"
echo "3. 测试各个模块（商品、供应商、入库、出库）"
echo "4. 检查API连接是否正常"
echo ""
echo "📋 故障排除："
echo "- 如果页面空白：检查控制台错误，可能是API地址配置问题"
echo "- 如果API调用失败：检查环境变量配置"
echo "- 如果样式异常：检查静态资源加载"
echo ""
echo "✅ 部署包准备完成！"
echo "请按照上述步骤在腾讯云EdgeOne控制台完成部署。"