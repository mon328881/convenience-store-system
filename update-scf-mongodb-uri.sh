#!/bin/bash

# 腾讯云函数MongoDB URI更新脚本
# 解决DNS解析问题，直接连接分片节点

echo "🔧 腾讯云函数MongoDB URI更新脚本"
echo "=================================="

# 新的MongoDB连接字符串（已修复DNS问题）
NEW_MONGODB_URI="mongodb://admin:UeVOSuzgZ4glfKBV@ac-dopjson-shard-00-00.b4d7wmh.mongodb.net:27017,ac-dopjson-shard-00-01.b4d7wmh.mongodb.net:27017,ac-dopjson-shard-00-02.b4d7wmh.mongodb.net:27017/convenience_store?ssl=true&replicaSet=atlas-126eq3-shard-0&authSource=admin&retryWrites=true&w=majority"

echo "📋 新的MongoDB连接字符串："
echo "$NEW_MONGODB_URI"
echo ""

echo "🚀 请按以下步骤操作："
echo ""
echo "1️⃣ 登录腾讯云控制台："
echo "   https://console.cloud.tencent.com/scf"
echo ""
echo "2️⃣ 选择函数："
echo "   - 地域：广州"
echo "   - 函数名：inventory-api"
echo ""
echo "3️⃣ 修改环境变量："
echo "   - 点击「函数配置」"
echo "   - 点击「环境变量」"
echo "   - 找到 MONGODB_URI"
echo "   - 替换为上面的新连接字符串"
echo ""
echo "4️⃣ 保存配置："
echo "   - 点击「保存」"
echo "   - 等待2-3分钟配置生效"
echo ""

echo "🧪 验证修复："
echo "=================================="

# 测试函数
test_scf_connection() {
    echo "正在测试腾讯云函数连接..."
    
    # 健康检查
    echo "📡 测试健康检查端点..."
    HEALTH_RESPONSE=$(curl -s "https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health")
    echo "响应: $HEALTH_RESPONSE"
    
    if echo "$HEALTH_RESPONSE" | grep -q '"database":"已连接"'; then
        echo "✅ 数据库连接成功！"
        return 0
    else
        echo "❌ 数据库连接仍然失败"
        return 1
    fi
}

echo "⏳ 等待你完成腾讯云函数配置更新..."
echo "完成后按回车键进行测试，或输入 'skip' 跳过测试"
read -r user_input

if [ "$user_input" != "skip" ]; then
    echo ""
    echo "🔍 开始验证修复结果..."
    
    # 等待配置生效
    echo "⏳ 等待配置生效（30秒）..."
    sleep 30
    
    # 测试连接
    if test_scf_connection; then
        echo ""
        echo "🎉 修复成功！"
        echo "✅ MongoDB DNS解析问题已解决"
        echo "✅ 腾讯云函数可以正常连接数据库"
        echo ""
        echo "📊 可以进行的测试："
        echo "curl https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health"
        echo "curl https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/products"
    else
        echo ""
        echo "⚠️ 修复可能需要更多时间生效"
        echo "请等待5-10分钟后重新测试"
        echo ""
        echo "🔧 如果问题持续，请检查："
        echo "1. 环境变量是否正确保存"
        echo "2. 连接字符串是否完整复制"
        echo "3. 腾讯云函数是否重新部署"
    fi
else
    echo "⏭️ 跳过自动测试"
    echo ""
    echo "📝 手动测试命令："
    echo "curl https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health"
fi

echo ""
echo "📋 修复原理："
echo "=================================="
echo "原问题: cluster0.b4d7wmh.mongodb.net DNS解析失败"
echo "解决方案: 直接连接可解析的分片节点"
echo "新连接: 使用3个分片节点的直接地址"
echo "优势: 绕过SRV记录解析问题"
echo ""
echo "🔗 相关文档："
echo "- DNS解析问题修复方案.md"
echo "- MongoDB-Atlas-白名单配置指南.md"