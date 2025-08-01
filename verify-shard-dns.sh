#!/bin/bash

# 腾讯云函数DNS解析验证脚本
# 检查分片节点在云函数环境中的DNS解析状态

echo "🔍 腾讯云函数DNS解析验证"
echo "=================================="

# 分片节点列表
SHARD_NODES=(
    "ac-dopjson-shard-00-00.b4d7wmh.mongodb.net"
    "ac-dopjson-shard-00-01.b4d7wmh.mongodb.net"
    "ac-dopjson-shard-00-02.b4d7wmh.mongodb.net"
)

echo "📋 本地DNS解析测试："
echo "--------------------------------"

for node in "${SHARD_NODES[@]}"; do
    echo "🔗 测试节点: $node"
    
    # 本地DNS解析
    if nslookup "$node" > /dev/null 2>&1; then
        IP=$(nslookup "$node" | grep "Address:" | tail -1 | awk '{print $2}')
        echo "  ✅ 本地解析成功: $IP"
        
        # 端口连通性测试
        if nc -z "$node" 27017 2>/dev/null; then
            echo "  ✅ 端口27017连通"
        else
            echo "  ❌ 端口27017不通"
        fi
    else
        echo "  ❌ 本地解析失败"
    fi
    echo ""
done

echo "🚨 潜在风险分析："
echo "--------------------------------"

echo "1️⃣ 腾讯云函数网络环境差异："
echo "   - 本地DNS服务器: $(cat /etc/resolv.conf | grep nameserver | head -1 | awk '{print $2}')"
echo "   - 腾讯云函数可能使用不同的DNS服务器"
echo "   - 某些域名在云函数环境中可能解析失败"
echo ""

echo "2️⃣ MongoDB Atlas分片节点特点："
echo "   - 分片节点域名相对稳定"
echo "   - 但仍可能受到DNS缓存影响"
echo "   - 建议使用IP地址作为最终备选方案"
echo ""

echo "🔧 更可靠的解决方案："
echo "--------------------------------"

echo "方案1: 使用IP地址直连（最可靠）"
echo "MONGODB_URI=\"mongodb://admin:UeVOSuzgZ4glfKBV@159.143.172.102:27017,159.143.172.137:27017,159.143.172.125:27017/convenience_store?ssl=true&replicaSet=atlas-126eq3-shard-0&authSource=admin&retryWrites=true&w=majority\""
echo ""

echo "方案2: 混合连接字符串（域名+IP备选）"
echo "在连接字符串中同时包含域名和IP地址"
echo ""

echo "方案3: 添加DNS超时和重试参数"
echo "在当前连接字符串中添加更严格的超时控制"
echo ""

echo "📊 获取最新IP地址："
echo "--------------------------------"

for i in "${!SHARD_NODES[@]}"; do
    node="${SHARD_NODES[$i]}"
    echo "分片 $i: $node"
    
    # 获取IP地址
    IP=$(nslookup "$node" 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    if [ -n "$IP" ]; then
        echo "  IP: $IP"
    else
        echo "  IP: 解析失败"
    fi
done

echo ""
echo "💡 建议："
echo "--------------------------------"
echo "1. 优先尝试当前的分片域名连接"
echo "2. 如果仍然失败，切换到IP地址连接"
echo "3. 监控连接稳定性，必要时调整策略"
echo ""
echo "🔗 生成IP连接字符串脚本: ./generate-ip-mongodb-uri.sh"