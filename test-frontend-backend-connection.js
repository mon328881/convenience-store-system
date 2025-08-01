// 前后端连接测试脚本
const API_BASE_URL = 'http://localhost:3000';

async function testConnection() {
    console.log('🔍 开始测试前后端连接...\n');
    
    try {
        // 1. 测试健康检查
        console.log('1. 测试健康检查端点...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ 健康检查成功:', healthData);
        
        // 2. 测试供应商API
        console.log('\n2. 测试供应商API...');
        const suppliersResponse = await fetch(`${API_BASE_URL}/api/suppliers`);
        if (suppliersResponse.ok) {
            const suppliersData = await suppliersResponse.json();
            console.log('✅ 供应商API成功:', `找到 ${suppliersData.length} 个供应商`);
            if (suppliersData.length > 0) {
                console.log('   示例供应商:', suppliersData[0]);
            }
        } else {
            console.log('❌ 供应商API失败:', suppliersResponse.status, suppliersResponse.statusText);
        }
        
        // 3. 测试产品API
        console.log('\n3. 测试产品API...');
        const productsResponse = await fetch(`${API_BASE_URL}/api/products`);
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            console.log('✅ 产品API成功:', `找到 ${productsData.length} 个产品`);
            if (productsData.length > 0) {
                console.log('   示例产品:', productsData[0]);
            }
        } else {
            console.log('❌ 产品API失败:', productsResponse.status, productsResponse.statusText);
        }
        
        // 4. 测试入库记录API
        console.log('\n4. 测试入库记录API...');
        const inboundResponse = await fetch(`${API_BASE_URL}/api/inbound`);
        if (inboundResponse.ok) {
            const inboundData = await inboundResponse.json();
            console.log('✅ 入库记录API成功:', `找到 ${inboundData.length} 条记录`);
        } else {
            console.log('❌ 入库记录API失败:', inboundResponse.status, inboundResponse.statusText);
        }
        
        // 5. 测试出库记录API
        console.log('\n5. 测试出库记录API...');
        const outboundResponse = await fetch(`${API_BASE_URL}/api/outbound`);
        if (outboundResponse.ok) {
            const outboundData = await outboundResponse.json();
            console.log('✅ 出库记录API成功:', `找到 ${outboundData.length} 条记录`);
        } else {
            console.log('❌ 出库记录API失败:', outboundResponse.status, outboundResponse.statusText);
        }
        
        // 6. 测试报表API
        console.log('\n6. 测试报表API...');
        const reportsResponse = await fetch(`${API_BASE_URL}/api/reports/dashboard`);
        if (reportsResponse.ok) {
            const reportsData = await reportsResponse.json();
            console.log('✅ 报表API成功:', reportsData);
        } else {
            console.log('❌ 报表API失败:', reportsResponse.status, reportsResponse.statusText);
        }
        
        console.log('\n🎉 前后端连接测试完成！');
        
    } catch (error) {
        console.error('❌ 连接测试失败:', error.message);
        console.error('请确保后端服务器正在运行在 http://localhost:3000');
    }
}

// 如果是在Node.js环境中运行
if (typeof window === 'undefined') {
    // Node.js环境，需要导入fetch
    const fetch = require('node-fetch');
    testConnection();
} else {
    // 浏览器环境
    testConnection();
}