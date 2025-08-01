#!/bin/bash

echo "🔧 MongoDB DNS问题紧急修复脚本"
echo "================================"
echo ""

# 腾讯云函数信息
SCF_URL="https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com"

echo "📋 当前问题："
echo "- cluster0.b4d7wmh.mongodb.net DNS解析失败"
echo "- 分片节点DNS解析正常"
echo ""

echo "🔧 修复方案：使用直连分片节点"
echo ""

# 生成修复后的连接字符串
FIXED_MONGODB_URI="mongodb://admin:UeVOSuzgZ4glfKBV@ac-dopjson-shard-00-00.b4d7wmh.mongodb.net:27017,ac-dopjson-shard-00-01.b4d7wmh.mongodb.net:27017,ac-dopjson-shard-00-02.b4d7wmh.mongodb.net:27017/convenience_store?ssl=true&replicaSet=atlas-126eq3-shard-0&authSource=admin&retryWrites=true&w=majority"

echo "📝 修复后的连接字符串："
echo "$FIXED_MONGODB_URI"
echo ""

echo "📋 修复步骤："
echo "1. 登录腾讯云控制台: https://console.cloud.tencent.com/scf"
echo "2. 选择函数: inventory-api"
echo "3. 函数配置 → 环境变量"
echo "4. 修改 MONGODB_URI 为上述连接字符串"
echo "5. 保存配置"
echo ""

echo "🧪 本地连接测试..."

# 创建本地测试脚本
cat > /tmp/test-fixed-connection.js << EOF
const mongoose = require('mongoose');

const MONGODB_URI = '$FIXED_MONGODB_URI';

console.log('🔍 测试修复后的MongoDB连接...');
console.log('连接字符串:', MONGODB_URI.replace(/UeVOSuzgZ4glfKBV/, '***'));

async function testConnection() {
    try {
        console.log('⏳ 正在连接...');
        
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 15000,
            maxPoolSize: 5
        });
        
        console.log('✅ 连接成功！');
        console.log('📊 连接状态:', mongoose.connection.readyState);
        console.log('🏷️  数据库名:', mongoose.connection.name);
        
        // 测试简单查询
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 可用集合:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        console.log('🔌 连接已断开');
        
        return true;
    } catch (error) {
        console.error('❌ 连接失败:', error.message);
        return false;
    }
}

testConnection().then(success => {
    if (success) {
        console.log('\\n🎉 修复方案验证成功！');
        console.log('请在腾讯云函数中应用此连接字符串。');
    } else {
        console.log('\\n⚠️ 修复方案需要进一步调整。');
    }
    process.exit(success ? 0 : 1);
});
EOF

# 检查是否有mongoose
if command -v node >/dev/null 2>&1; then
    if [ -f "package.json" ] && grep -q "mongoose" package.json; then
        echo "📦 运行本地连接测试..."
        node /tmp/test-fixed-connection.js
    else
        echo "⚠️ 本地环境缺少mongoose，跳过连接测试"
    fi
else
    echo "⚠️ Node.js不可用，跳过连接测试"
fi

echo ""
echo "🔍 等待配置生效后测试腾讯云函数..."
echo "测试命令: curl $SCF_URL/api/health"
echo ""

echo "📊 预期成功响应："
cat << 'EOF'
{
  "success": true,
  "message": "API正常运行",
  "database": "已连接",
  "timestamp": "2025-01-29T..."
}
EOF

echo ""
echo "🎯 修复完成后的验证清单："
echo "- [ ] 健康检查返回成功"
echo "- [ ] 商品API正常工作"
echo "- [ ] 供应商API正常工作"
echo "- [ ] 库存API正常工作"
echo "- [ ] 响应时间正常(<2秒)"

# 清理临时文件
rm -f /tmp/test-fixed-connection.js

echo ""
echo "✅ 修复脚本执行完成！"