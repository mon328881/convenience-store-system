#!/bin/bash

# 生成基于IP地址的MongoDB连接字符串
# 最可靠的连接方案，完全绕过DNS解析

echo "🔧 生成IP地址MongoDB连接字符串"
echo "=================================="

# 分片节点IP地址（从DNS解析获得）
SHARD_IPS=(
    "159.143.172.102"  # ac-dopjson-shard-00-00
    "159.143.172.137"  # ac-dopjson-shard-00-01  
    "159.143.172.125"  # ac-dopjson-shard-00-02
)

# 生成IP连接字符串
IP_MONGODB_URI="mongodb://admin:UeVOSuzgZ4glfKBV@${SHARD_IPS[0]}:27017,${SHARD_IPS[1]}:27017,${SHARD_IPS[2]}:27017/convenience_store?ssl=true&replicaSet=atlas-126eq3-shard-0&authSource=admin&retryWrites=true&w=majority"

echo "📋 IP地址连接字符串："
echo "--------------------------------"
echo "$IP_MONGODB_URI"
echo ""

echo "🔍 IP地址映射："
echo "--------------------------------"
echo "159.143.172.102 → ac-dopjson-shard-00-00.b4d7wmh.mongodb.net"
echo "159.143.172.137 → ac-dopjson-shard-00-01.b4d7wmh.mongodb.net"
echo "159.143.172.125 → ac-dopjson-shard-00-02.b4d7wmh.mongodb.net"
echo ""

echo "✅ 优势："
echo "--------------------------------"
echo "• 完全绕过DNS解析问题"
echo "• 连接速度更快（无DNS查询延迟）"
echo "• 不受DNS缓存影响"
echo "• 在任何网络环境中都稳定"
echo ""

echo "⚠️ 注意事项："
echo "--------------------------------"
echo "• IP地址可能会变化（但MongoDB Atlas较稳定）"
echo "• 需要定期验证IP地址有效性"
echo "• SSL证书验证可能需要特殊处理"
echo ""

echo "🚀 应用步骤："
echo "--------------------------------"
echo "1. 复制上面的IP连接字符串"
echo "2. 登录腾讯云控制台"
echo "3. 更新 inventory-api 函数的 MONGODB_URI 环境变量"
echo "4. 保存并等待配置生效"
echo ""

# 测试IP连接
echo "🧪 本地IP连接测试："
echo "--------------------------------"

for i in "${!SHARD_IPS[@]}"; do
    ip="${SHARD_IPS[$i]}"
    echo "测试分片 $i (IP: $ip):"
    
    if nc -z "$ip" 27017 2>/dev/null; then
        echo "  ✅ 端口27017连通"
    else
        echo "  ❌ 端口27017不通"
    fi
done

echo ""
echo "💾 保存到文件："
echo "--------------------------------"

# 保存到文件
cat > /Users/suizhihao/Trae/ke/mongodb-ip-uri.txt << EOF
# MongoDB Atlas IP地址连接字符串
# 生成时间: $(date)
# 用途: 腾讯云函数环境变量 MONGODB_URI

$IP_MONGODB_URI

# 分片节点IP映射:
# 159.143.172.102 → ac-dopjson-shard-00-00.b4d7wmh.mongodb.net
# 159.143.172.137 → ac-dopjson-shard-00-01.b4d7wmh.mongodb.net  
# 159.143.172.125 → ac-dopjson-shard-00-02.b4d7wmh.mongodb.net
EOF

echo "✅ IP连接字符串已保存到: mongodb-ip-uri.txt"
echo ""

echo "🔄 如果当前域名方案失败，请使用此IP方案"
echo "这是最可靠的连接方式，可以完全解决DNS问题"