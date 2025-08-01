#!/bin/bash

echo "🔧 MongoDB连接字符串优化测试"
echo "================================"

echo ""
echo "📋 当前问题："
echo "- ReplicaSetNoPrimary错误"
echo "- 集群无法找到主节点"
echo "- 需要优化连接参数"
echo ""

echo "🎯 优化方案测试："
echo ""

# 方案1: 添加重试和写入确认参数
echo "方案1: 添加重试和写入确认参数"
echo "MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority"
echo ""

# 方案2: 添加超时参数
echo "方案2: 添加超时参数"
echo "MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000"
echo ""

# 方案3: 完整优化参数
echo "方案3: 完整优化参数（推荐）"
echo "MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=15000"
echo ""

# 方案4: 最大兼容性参数
echo "方案4: 最大兼容性参数"
echo "MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=15000&maxPoolSize=10&minPoolSize=1"
echo ""

echo "📝 操作步骤："
echo "1. 登录腾讯云控制台"
echo "2. 进入云函数 -> inventory-api"
echo "3. 点击'函数配置' -> '环境变量'"
echo "4. 修改MONGODB_URI为上述方案之一"
echo "5. 保存配置"
echo "6. 等待2-3分钟配置生效"
echo "7. 重新测试连接"
echo ""

echo "🧪 建议测试顺序："
echo "1. 先尝试方案3（完整优化参数）"
echo "2. 如果失败，尝试方案1（基础重试参数）"
echo "3. 如果仍失败，尝试方案4（最大兼容性）"
echo ""

echo "⚠️  重要提示："
echo "- 每次修改后等待2-3分钟"
echo "- 如果所有方案都失败，可能需要重新生成MongoDB用户密码"
echo "- 也可能需要检查MongoDB Atlas集群状态"
echo ""

echo "🔍 检查MongoDB Atlas集群状态："
echo "1. 访问 https://cloud.mongodb.com/"
echo "2. 选择你的项目和集群"
echo "3. 查看集群状态是否为'Available'"
echo "4. 如果状态异常，等待集群恢复正常"