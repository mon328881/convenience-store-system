#!/bin/bash

echo "=== 腾讯云函数重新部署指南 ==="
echo ""

echo "🔍 问题分析："
echo "✅ 本地MongoDB连接测试成功"
echo "❌ 腾讯云函数仍然报告数据库连接失败"
echo "🔧 可能原因：环境变量未更新或函数需要重新部署"
echo ""

echo "📋 解决步骤："
echo ""

echo "1️⃣ 确认环境变量配置"
echo "访问腾讯云函数控制台："
echo "https://console.cloud.tencent.com/scf"
echo ""
echo "检查以下环境变量："
echo "MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0"
echo "JWT_SECRET=MyConvenienceStore2024SecretKey!@#\$%RandomString123456789"
echo "NODE_ENV=production"
echo ""

echo "2️⃣ 重新部署函数"
echo "方法1: 在控制台重新部署"
echo "- 点击'函数代码'标签"
echo "- 点击'部署'按钮"
echo "- 等待部署完成"
echo ""

echo "方法2: 使用本地部署脚本"
echo "cd edge-functions/scf-deploy"
echo "./deploy-scf.sh"
echo ""

echo "3️⃣ 验证部署结果"
echo "部署完成后运行："
echo "./verify-fixed-ip.sh"
echo ""

echo "⚠️  重要提示："
echo "- 环境变量更新后需要重新部署才能生效"
echo "- 部署过程可能需要1-2分钟"
echo "- 确保MongoDB URI包含数据库名称 'convenience_store'"
echo ""

echo "🎯 预期结果："
echo "部署成功后，健康检查应该返回："
echo '{"status":"ok","message":"库存管理系统API运行正常",...}'