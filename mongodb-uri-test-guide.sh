#!/bin/bash

echo "🔧 MongoDB连接字符串测试方案"
echo "=================================="

echo ""
echo "📋 问题分析："
echo "从错误日志可以看到，虽然IP白名单已配置，但仍然出现 'ReplicaSetNoPrimary' 错误"
echo "这通常表示连接字符串格式或数据库配置有问题"
echo ""

echo "🎯 测试方案："
echo ""

echo "方案2 - 简化版MONGODB_URI（去掉appName参数）："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority"
echo ""

echo "方案3 - 无数据库名MONGODB_URI："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority"
echo ""

echo "方案4 - 最简版MONGODB_URI："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/"
echo ""

echo "📝 操作步骤："
echo "1. 登录腾讯云控制台"
echo "2. 进入云函数 -> inventory-api"
echo "3. 点击'函数配置' -> '环境变量'"
echo "4. 修改 MONGODB_URI 的值"
echo "5. 保存配置"
echo "6. 等待1-2分钟让配置生效"
echo "7. 运行测试脚本验证"
echo ""

echo "🧪 当前连接测试："
response=$(curl -s "https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health")
echo "响应: $response"
echo ""

echo "💡 建议测试顺序："
echo "1. 先尝试方案2（简化版）"
echo "2. 如果失败，尝试方案3（无数据库名）"
echo "3. 如果仍然失败，尝试方案4（最简版）"
echo ""

echo "⚠️  重要提醒："
echo "- 每次修改后等待1-2分钟让配置生效"
echo "- 如果所有方案都失败，可能需要重新生成MongoDB用户密码"
echo "- 确保MongoDB Atlas集群状态正常"