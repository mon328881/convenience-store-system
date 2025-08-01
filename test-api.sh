#!/bin/bash

echo "=== 测试腾讯云函数API ==="
echo "函数URL: https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com"
echo ""

echo "1. 测试健康检查..."
curl -s https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health | jq '.' 2>/dev/null || curl -s https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/health
echo ""
echo ""

echo "2. 测试产品列表..."
curl -s https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/products | jq '.' 2>/dev/null || curl -s https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/api/products
echo ""
echo ""

echo "3. 测试根路径..."
curl -s https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/ | jq '.' 2>/dev/null || curl -s https://1371559131-hunc74y9qz.ap-guangzhou.tencentscf.com/
echo ""