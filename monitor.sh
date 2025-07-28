#!/bin/bash

# 服务器监控脚本
echo "开始监控服务器状态..."

# 检查服务器是否响应
check_server() {
    local endpoint=$1
    local name=$2
    
    response=$(curl -s -w "%{http_code}" -o /dev/null "$endpoint")
    if [ "$response" = "200" ]; then
        echo "✅ $name API 正常 (HTTP $response)"
        return 0
    else
        echo "❌ $name API 异常 (HTTP $response)"
        return 1
    fi
}

# 监控循环
for i in {1..20}; do
    echo "=== 监控轮次 $i $(date) ==="
    
    # 检查各个API端点
    check_server "http://localhost:3000/api/products" "商品管理"
    check_server "http://localhost:3000/api/suppliers" "供应商管理"
    check_server "http://localhost:3000/api/inbound" "入库管理"
    check_server "http://localhost:3000/api/outbound" "出库管理"
    check_server "http://localhost:3000/api/reports/stats" "报表统计"
    check_server "http://localhost:3000/api/reports/category-stats" "分类统计"
    check_server "http://localhost:3000/api/reports/brand-stats" "品牌统计"
    check_server "http://localhost:3000/api/reports/sales-trend" "销售趋势"
    
    echo "监控轮次 $i 完成"
    echo "---"
    sleep 5
done

echo "监控完成！"