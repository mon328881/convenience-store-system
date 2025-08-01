#!/bin/bash

echo "=== 创建符合腾讯云函数规范的部署包 ==="

# 创建临时目录
rm -rf temp-deploy
mkdir temp-deploy
cd temp-deploy

# 复制并修改 index.js，确保有正确的入口函数
cat > index.js << 'EOF'
// 腾讯云函数入口点
exports.main_handler = async (event, context) => {
    console.log('收到请求:', JSON.stringify(event, null, 2));
    
    try {
        // 解析请求
        const method = event.httpMethod || 'GET';
        const path = event.path || '/';
        const queryString = event.queryString || {};
        const headers = event.headers || {};
        const body = event.body || '';
        
        console.log(`处理请求: ${method} ${path}`);
        
        // 设置 CORS 头
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        };
        
        // 处理 OPTIONS 预检请求
        if (method === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }
        
        // 模拟供应商数据
        const mockSuppliers = [
            {
                id: 1,
                name: "科技供应商A",
                contact: "张经理",
                phone: "138-0000-1111",
                email: "zhang@supplier-a.com",
                address: "北京市朝阳区科技园区A座",
                status: "active",
                rating: 4.8,
                products: ["笔记本电脑", "台式机", "服务器"],
                contractStart: "2024-01-01",
                contractEnd: "2024-12-31"
            },
            {
                id: 2,
                name: "办公用品供应商B",
                contact: "李总监",
                phone: "139-0000-2222",
                email: "li@supplier-b.com",
                address: "上海市浦东新区商务大厦B座",
                status: "active",
                rating: 4.5,
                products: ["办公桌椅", "文具用品", "打印设备"],
                contractStart: "2024-02-01",
                contractEnd: "2025-01-31"
            },
            {
                id: 3,
                name: "网络设备供应商C",
                contact: "王工程师",
                phone: "137-0000-3333",
                email: "wang@supplier-c.com",
                address: "深圳市南山区高新技术园C座",
                status: "pending",
                rating: 4.2,
                products: ["路由器", "交换机", "防火墙"],
                contractStart: "2024-03-01",
                contractEnd: "2024-11-30"
            }
        ];
        
        // 路由处理
        if (path === '/health' || path === '/') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    status: 'healthy',
                    message: '库存管理系统API运行正常',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                })
            };
        }
        
        if (path === '/api/suppliers' && method === 'GET') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    data: mockSuppliers,
                    total: mockSuppliers.length,
                    message: '获取供应商列表成功'
                })
            };
        }
        
        if (path.startsWith('/api/suppliers/') && method === 'GET') {
            const supplierId = parseInt(path.split('/')[3]);
            const supplier = mockSuppliers.find(s => s.id === supplierId);
            
            if (supplier) {
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: true,
                        data: supplier,
                        message: '获取供应商详情成功'
                    })
                };
            } else {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        message: '供应商不存在'
                    })
                };
            }
        }
        
        // 默认404响应
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                message: '接口不存在',
                path: path,
                method: method
            })
        };
        
    } catch (error) {
        console.error('处理请求时发生错误:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: '服务器内部错误',
                error: error.message
            })
        };
    }
};

// 兼容性：同时导出 handler 函数
exports.handler = exports.main_handler;
EOF

# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "inventory-api-scf",
  "version": "1.0.0",
  "description": "库存管理系统API - 腾讯云函数版本",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {},
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# 创建部署包
zip -r ../scf-deploy-correct.zip .

cd ..
rm -rf temp-deploy

echo "✅ 正确的部署包已创建: scf-deploy-correct.zip"
echo "📦 文件大小: $(ls -lh scf-deploy-correct.zip | awk '{print $5}')"
echo ""
echo "🔧 关键修复:"
echo "1. 使用正确的入口函数名: main_handler"
echo "2. 符合腾讯云函数的事件和上下文参数"
echo "3. 正确的响应格式"
echo "4. 完整的错误处理"
echo ""
echo "📋 部署步骤:"
echo "1. 登录腾讯云函数控制台"
echo "2. 选择 inventory-api 函数"
echo "3. 上传 scf-deploy-correct.zip"
echo "4. 设置入口函数为: index.main_handler"
echo "5. 保存并部署"