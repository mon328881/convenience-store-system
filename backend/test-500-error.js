#!/usr/bin/env node

const http = require('http');

// 测试配置
const TEST_CONFIG = {
    host: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }
};

let successCount = 0;
let errorCount = 0;
let error500Count = 0;
let totalRequests = 0;

function makeRequest(requestId) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const req = http.request(TEST_CONFIG, (res) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                totalRequests++;
                
                if (res.statusCode === 200) {
                    successCount++;
                    console.log(`✅ 请求 ${requestId}: 200 OK (${duration}ms)`);
                } else if (res.statusCode === 500) {
                    error500Count++;
                    console.log(`❌ 请求 ${requestId}: 500 错误 (${duration}ms)`);
                    console.log(`   响应内容: ${data.substring(0, 200)}...`);
                } else {
                    errorCount++;
                    console.log(`⚠️  请求 ${requestId}: ${res.statusCode} (${duration}ms)`);
                }
                
                resolve({
                    requestId,
                    statusCode: res.statusCode,
                    duration,
                    data: data.substring(0, 500)
                });
            });
        });
        
        req.on('error', (err) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            totalRequests++;
            errorCount++;
            console.log(`💥 请求 ${requestId}: 网络错误 (${duration}ms) - ${err.message}`);
            
            resolve({
                requestId,
                error: err.message,
                duration
            });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`⏰ 请求 ${requestId}: 超时`);
        });
        
        req.end();
    });
}

async function runTest(testName, requestCount, concurrent = false) {
    console.log(`\n🚀 开始测试: ${testName}`);
    console.log(`📊 请求数量: ${requestCount}, 并发: ${concurrent ? '是' : '否'}`);
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    if (concurrent) {
        // 并发请求
        const promises = [];
        for (let i = 1; i <= requestCount; i++) {
            promises.push(makeRequest(i));
        }
        await Promise.all(promises);
    } else {
        // 串行请求
        for (let i = 1; i <= requestCount; i++) {
            await makeRequest(i);
            // 短暂延迟避免过快请求
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    console.log('\n📈 测试结果统计:');
    console.log(`   总请求数: ${totalRequests}`);
    console.log(`   成功 (200): ${successCount}`);
    console.log(`   500错误: ${error500Count}`);
    console.log(`   其他错误: ${errorCount}`);
    console.log(`   总耗时: ${totalDuration}ms`);
    console.log(`   平均耗时: ${Math.round(totalDuration / requestCount)}ms/请求`);
    
    if (error500Count > 0) {
        console.log(`\n🔍 发现 ${error500Count} 个500错误！`);
        return true;
    } else {
        console.log('\n✅ 未发现500错误');
        return false;
    }
}

async function main() {
    console.log('🔍 后端服务器500错误诊断工具');
    console.log(`🎯 目标服务器: http://${TEST_CONFIG.host}:${TEST_CONFIG.port}${TEST_CONFIG.path}`);
    
    // 重置计数器
    successCount = 0;
    errorCount = 0;
    error500Count = 0;
    totalRequests = 0;
    
    // 测试1: 串行请求
    let found500 = await runTest('串行请求测试', 20, false);
    
    if (!found500) {
        // 重置计数器
        successCount = 0;
        errorCount = 0;
        error500Count = 0;
        totalRequests = 0;
        
        // 测试2: 并发请求
        found500 = await runTest('并发请求测试', 50, true);
    }
    
    if (!found500) {
        // 重置计数器
        successCount = 0;
        errorCount = 0;
        error500Count = 0;
        totalRequests = 0;
        
        // 测试3: 高频请求
        found500 = await runTest('高频请求测试', 100, true);
    }
    
    if (found500) {
        console.log('\n🎉 成功复现500错误！请检查服务器日志获取详细信息。');
        process.exit(1);
    } else {
        console.log('\n🤔 未能复现500错误，可能需要其他触发条件。');
        process.exit(0);
    }
}

// 处理程序退出
process.on('SIGINT', () => {
    console.log('\n\n⏹️  测试被中断');
    console.log(`📊 最终统计: 成功${successCount}, 500错误${error500Count}, 其他错误${errorCount}`);
    process.exit(0);
});

main().catch(console.error);