#!/bin/bash

echo "🔄 回退到稳定版本..."
echo "📦 使用版本: scf-deploy-fixed-v3.zip"
echo ""

# 检查文件是否存在
if [ ! -f "scf-deploy-fixed-v3.zip" ]; then
    echo "❌ 错误: scf-deploy-fixed-v3.zip 文件不存在"
    exit 1
fi

echo "✅ 稳定版本文件已确认存在"
echo ""

echo "📋 回退步骤："
echo "1. 登录腾讯云函数控制台"
echo "2. 选择您的 inventory-api 函数"
echo "3. 上传 scf-deploy-fixed-v3.zip 文件"
echo "4. 保存并部署"
echo ""

echo "🧪 测试命令："
echo "curl 'https://your-function-url/api/health'"
echo "curl 'https://your-function-url/api/suppliers'"
echo ""

echo "✨ 稳定版本特性："
echo "- ✅ 数据一致性问题已修复"
echo "- ✅ 全局变量状态持久化问题已解决"
echo "- ✅ 供应商更新API bug已修复"
echo "- ✅ 数据重置功能已添加"
echo "- ✅ 深拷贝防护已实现"
echo ""

echo "🎯 这个版本使用模拟数据，稳定可靠，适合当前使用！"