#!/bin/bash

echo "=== 腾讯云函数固定IP验证脚本 ==="
echo ""

FIXED_IP="175.178.229.42"
echo "🔍 验证固定IP: $FIXED_IP"
echo ""

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "❌ 未找到 .env 文件"
    echo "请先创建 .env 文件并配置 SCF_URL"
    echo ""
    echo "示例配置:"
    echo "SCF_URL=https://service-xxxxxxxx-xxxxxxxxx.gz.apigw.tencentcs.com"
    echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
    echo "JWT_SECRET=your-jwt-secret"
    echo "NODE_ENV=production"
    exit 1
fi

# 读取SCF_URL
source .env
if [ -z "$SCF_URL" ]; then
    echo "❌ .env 文件中未配置 SCF_URL"
    echo "请在 .env 文件中添加: SCF_URL=https://your-function-url"
    exit 1
fi

echo "📡 测试腾讯云函数: $SCF_URL"
echo ""

# 测试健康检查接口
echo "🔍 测试健康检查接口..."
HEALTH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$SCF_URL/api/health")
HTTP_STATUS=$(echo $HEALTH_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $HEALTH_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "状态码: $HTTP_STATUS"
echo "响应内容: $RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    if echo "$RESPONSE_BODY" | grep -q '"success":true'; then
        echo "✅ 数据库连接成功！固定IP配置正确"
        echo ""
        echo "🎉 配置验证通过："
        echo "   - 腾讯云函数固定IP: $FIXED_IP"
        echo "   - MongoDB Atlas白名单: 已正确配置"
        echo "   - 数据库连接: 正常"
    else
        echo "⚠️  函数运行正常，但数据库连接失败"
        echo ""
        echo "🔧 可能的原因："
        echo "1. MongoDB Atlas白名单未添加IP: $FIXED_IP"
        echo "2. 环境变量MONGODB_URI配置错误"
        echo "3. 数据库用户名密码错误"
        echo ""
        echo "📋 下一步操作："
        echo "1. 登录 MongoDB Atlas: https://cloud.mongodb.com"
        echo "2. 进入 Network Access 页面"
        echo "3. 点击 'ADD IP ADDRESS'"
        echo "4. 输入IP地址: $FIXED_IP"
        echo "5. 点击 'Confirm' 保存"
    fi
elif [ "$HTTP_STATUS" = "000" ]; then
    echo "❌ 网络连接失败"
    echo "请检查SCF_URL是否正确: $SCF_URL"
else
    echo "❌ 函数返回错误状态码: $HTTP_STATUS"
    echo "请检查腾讯云函数部署状态"
fi

echo ""
echo "📖 详细配置指南:"
echo "   MongoDB Atlas: /Users/suizhihao/Trae/ke/MongoDB Atlas配置指南.md"
echo "   环境变量配置: /Users/suizhihao/Trae/ke/腾讯云函数环境变量完整配置.md"