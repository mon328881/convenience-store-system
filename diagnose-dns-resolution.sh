#!/bin/bash

echo "🔍 MongoDB Atlas DNS解析诊断脚本"
echo "=================================="
echo ""

# MongoDB Atlas集群地址
CLUSTER_HOST="cluster0.b4d7wmh.mongodb.net"
SHARD_HOSTS=(
    "ac-dopjson-shard-00-00.b4d7wmh.mongodb.net"
    "ac-dopjson-shard-00-01.b4d7wmh.mongodb.net" 
    "ac-dopjson-shard-00-02.b4d7wmh.mongodb.net"
)

echo "📋 测试1: 主集群地址DNS解析"
echo "主机: $CLUSTER_HOST"
echo "---"

# 测试主集群DNS解析
if command -v nslookup >/dev/null 2>&1; then
    echo "🔍 nslookup 解析结果:"
    nslookup $CLUSTER_HOST
    echo ""
else
    echo "⚠️ nslookup 命令不可用"
fi

if command -v dig >/dev/null 2>&1; then
    echo "🔍 dig 解析结果:"
    dig $CLUSTER_HOST
    echo ""
else
    echo "⚠️ dig 命令不可用"
fi

# 测试ping连通性
echo "🏓 Ping 连通性测试:"
ping -c 3 $CLUSTER_HOST
echo ""

echo "📋 测试2: 分片节点DNS解析"
echo "---"

for shard in "${SHARD_HOSTS[@]}"; do
    echo "🔍 测试分片: $shard"
    
    # DNS解析测试
    if command -v nslookup >/dev/null 2>&1; then
        echo "nslookup 结果:"
        nslookup $shard | grep -E "(Address|Name)" | head -5
    fi
    
    # Ping测试
    echo "Ping 测试:"
    ping -c 1 $shard | grep -E "(PING|64 bytes|ping statistics)" || echo "❌ Ping 失败"
    echo "---"
done

echo "📋 测试3: MongoDB端口连通性"
echo "---"

for shard in "${SHARD_HOSTS[@]}"; do
    echo "🔌 测试 $shard:27017"
    
    # 使用nc测试端口连通性
    if command -v nc >/dev/null 2>&1; then
        timeout 5 nc -zv $shard 27017 2>&1 || echo "❌ 端口27017不可达"
    elif command -v telnet >/dev/null 2>&1; then
        timeout 5 telnet $shard 27017 2>&1 | grep -E "(Connected|Connection)" || echo "❌ 端口27017不可达"
    else
        echo "⚠️ nc/telnet 命令不可用，无法测试端口连通性"
    fi
    echo ""
done

echo "📋 测试4: 腾讯云函数网络环境测试"
echo "---"

SCF_URL="https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com"

echo "🌐 创建网络诊断测试..."

# 创建临时的网络诊断函数测试
cat > /tmp/network-test.js << 'EOF'
const dns = require('dns');
const net = require('net');

// DNS解析测试
function testDNS(hostname) {
    return new Promise((resolve) => {
        dns.lookup(hostname, (err, address, family) => {
            if (err) {
                resolve({ hostname, error: err.message, success: false });
            } else {
                resolve({ hostname, address, family, success: true });
            }
        });
    });
}

// 端口连通性测试
function testPort(hostname, port, timeout = 5000) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        
        socket.setTimeout(timeout);
        
        socket.on('connect', () => {
            socket.destroy();
            resolve({ hostname, port, success: true });
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ hostname, port, error: 'timeout', success: false });
        });
        
        socket.on('error', (err) => {
            socket.destroy();
            resolve({ hostname, port, error: err.message, success: false });
        });
        
        socket.connect(port, hostname);
    });
}

async function runNetworkDiagnostics() {
    console.log('🔍 腾讯云函数网络诊断');
    console.log('======================');
    
    const hosts = [
        'cluster0.b4d7wmh.mongodb.net',
        'ac-dopjson-shard-00-00.b4d7wmh.mongodb.net',
        'ac-dopjson-shard-00-01.b4d7wmh.mongodb.net',
        'ac-dopjson-shard-00-02.b4d7wmh.mongodb.net'
    ];
    
    // DNS解析测试
    console.log('\n📋 DNS解析测试:');
    for (const host of hosts) {
        const result = await testDNS(host);
        if (result.success) {
            console.log(`✅ ${host} -> ${result.address}`);
        } else {
            console.log(`❌ ${host} -> ${result.error}`);
        }
    }
    
    // 端口连通性测试
    console.log('\n📋 端口连通性测试:');
    for (const host of hosts) {
        const result = await testPort(host, 27017);
        if (result.success) {
            console.log(`✅ ${host}:27017 连接成功`);
        } else {
            console.log(`❌ ${host}:27017 -> ${result.error}`);
        }
    }
}

runNetworkDiagnostics().catch(console.error);
EOF

echo "📝 本地网络诊断测试:"
node /tmp/network-test.js

echo ""
echo "📋 测试5: 系统DNS配置检查"
echo "---"

echo "🔍 当前DNS配置:"
if [ -f /etc/resolv.conf ]; then
    cat /etc/resolv.conf | grep nameserver
else
    echo "⚠️ /etc/resolv.conf 不存在"
fi

echo ""
echo "🔍 系统网络配置:"
if command -v networksetup >/dev/null 2>&1; then
    echo "DNS服务器配置:"
    networksetup -getdnsservers Wi-Fi 2>/dev/null || echo "无法获取DNS配置"
fi

echo ""
echo "📊 诊断总结"
echo "=========="
echo "1. 如果DNS解析失败 -> 需要检查腾讯云函数的DNS配置"
echo "2. 如果端口不可达 -> 可能是网络策略或防火墙问题"
echo "3. 如果本地正常但云函数异常 -> 腾讯云网络环境限制"
echo ""
echo "🔧 可能的解决方案:"
echo "- 使用IP地址替代域名"
echo "- 配置腾讯云函数的DNS服务器"
echo "- 检查腾讯云的网络策略"
echo "- 联系腾讯云技术支持"

# 清理临时文件
rm -f /tmp/network-test.js