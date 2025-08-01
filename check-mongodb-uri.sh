#!/bin/bash

echo "🔍 MongoDB连接字符串格式检查"
echo "=================================="

echo ""
echo "📋 当前MONGODB_URI分析："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0"
echo ""

echo "🔧 可能的问题："
echo "1. 密码中可能包含特殊字符需要URL编码"
echo "2. 数据库名称可能不正确"
echo "3. 集群地址可能有变化"
echo ""

echo "💡 建议尝试的MONGODB_URI格式："
echo ""
echo "格式1（当前）："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0"
echo ""
echo "格式2（简化版）："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority"
echo ""
echo "格式3（无数据库名）："
echo "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority"
echo ""

echo "🎯 建议操作："
echo "1. 先尝试格式2（去掉appName参数）"
echo "2. 如果仍然失败，尝试格式3（去掉数据库名）"
echo "3. 检查MongoDB Atlas中的用户权限"
echo "4. 确认集群状态是否正常"
echo ""

echo "🧪 测试当前连接..."
response=$(curl -s "https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health")
echo "响应: $response"

echo ""
echo "📞 如果问题持续："
echo "1. 在MongoDB Atlas中重新生成用户密码"
echo "2. 重新获取连接字符串"
echo "3. 检查腾讯云函数的详细错误日志"