#!/bin/bash

echo "=== 深度MongoDB连接问题诊断 ==="
echo ""

SCF_URL="https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com"

echo "🔍 测试1: 检查函数基本响应"
response1=$(curl -s -w "HTTPSTATUS:%{http_code}" "$SCF_URL")
http_code1=$(echo $response1 | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
content1=$(echo $response1 | sed -e 's/HTTPSTATUS:.*//g')

echo "状态码: $http_code1"
echo "响应内容: $content1"
echo ""

echo "🔍 测试2: 检查环境变量端点"
response2=$(curl -s -w "HTTPSTATUS:%{http_code}" "$SCF_URL/api/debug/env")
http_code2=$(echo $response2 | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
content2=$(echo $response2 | sed -e 's/HTTPSTATUS:.*//g')

echo "状态码: $http_code2"
echo "响应内容: $content2"
echo ""

echo "🔍 测试3: 检查MongoDB连接详情"
response3=$(curl -s -w "HTTPSTATUS:%{http_code}" "$SCF_URL/api/debug/mongodb")
http_code3=$(echo $response3 | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
content3=$(echo $response3 | sed -e 's/HTTPSTATUS:.*//g')

echo "状态码: $http_code3"
echo "响应内容: $content3"
echo ""

echo "🔍 测试4: 检查数据库名称配置"
response4=$(curl -s -w "HTTPSTATUS:%{http_code}" "$SCF_URL/api/debug/database")
http_code4=$(echo $response4 | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
content4=$(echo $response4 | sed -e 's/HTTPSTATUS:.*//g')

echo "状态码: $http_code4"
echo "响应内容: $content4"
echo ""

echo "📊 诊断总结:"
echo ""

if [[ "$http_code1" == "500" ]]; then
    echo "❌ 函数运行但数据库连接失败"
    
    if [[ "$content1" == *"数据库连接失败"* ]]; then
        echo "🔍 可能的原因："
        echo "1. MongoDB URI中缺少数据库名称"
        echo "2. MongoDB Atlas白名单未生效"
        echo "3. 网络连接问题"
        echo "4. MongoDB集群状态异常"
    fi
else
    echo "✅ 函数响应正常"
fi

echo ""
echo "🔧 建议检查项目："
echo "1. 确认腾讯云函数中的MONGODB_URI包含数据库名称"
echo "2. 检查MongoDB Atlas集群状态"
echo "3. 验证白名单IP: 175.178.229.42/32"
echo "4. 检查函数日志获取详细错误信息"