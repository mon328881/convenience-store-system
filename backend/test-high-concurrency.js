const http = require('http');

// 高并发测试配置
const TEST_CONFIG = {
  host: 'localhost',
  port: 3000,
  totalRequests: 500,
  concurrentBatches: 10,
  batchSize: 50,
  timeout: 5000
};

// 统计信息
const stats = {
  total: 0,
  success: 0,
  error500: 0,
  error429: 0,
  errorTimeout: 0,
  errorConnection: 0,
  otherErrors: 0,
  startTime: Date.now(),
  responses: []
};

// 创建HTTP请求
function makeRequest(requestId, scenario) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    // 不同测试场景的请求配置
    const scenarios = {
      normal: {
        method: 'GET',
        path: '/',
        headers: {
          'User-Agent': `HighConcurrency-Test/${requestId}`,
          'Accept': 'application/json'
        }
      },
      withData: {
        method: 'POST',
        path: '/',
        headers: {
          'User-Agent': `HighConcurrency-Test/${requestId}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: JSON.stringify({ test: true, requestId, timestamp: Date.now() })
      },
      heavyHeaders: {
        method: 'GET',
        path: '/',
        headers: {
          'User-Agent': `HighConcurrency-Test/${requestId}`,
          'Accept': 'application/json',
          'X-Custom-Header-1': 'A'.repeat(1000),
          'X-Custom-Header-2': 'B'.repeat(1000),
          'X-Custom-Header-3': 'C'.repeat(1000)
        }
      },
      rapidFire: {
        method: 'GET',
        path: '/',
        headers: {
          'User-Agent': `RapidFire-Test/${requestId}`,
          'Accept': 'application/json',
          'Connection': 'close'
        }
      }
    };

    const config = scenarios[scenario] || scenarios.normal;
    
    const options = {
      hostname: TEST_CONFIG.host,
      port: TEST_CONFIG.port,
      path: config.path,
      method: config.method,
      headers: config.headers,
      timeout: TEST_CONFIG.timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const result = {
          requestId,
          scenario,
          statusCode: res.statusCode,
          responseTime,
          success: res.statusCode === 200,
          error: res.statusCode >= 400,
          timestamp: endTime
        };
        
        // 更新统计
        stats.total++;
        if (res.statusCode === 200) {
          stats.success++;
        } else if (res.statusCode === 500) {
          stats.error500++;
          console.log(`🔴 500错误 - 请求${requestId} (${scenario}): ${responseTime}ms`);
        } else if (res.statusCode === 429) {
          stats.error429++;
          console.log(`🟡 429限流 - 请求${requestId} (${scenario}): ${responseTime}ms`);
        } else {
          stats.otherErrors++;
          console.log(`🟠 其他错误 - 请求${requestId} (${scenario}): ${res.statusCode} - ${responseTime}ms`);
        }
        
        stats.responses.push(result);
        resolve(result);
      });
    });

    req.on('error', (err) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      stats.total++;
      if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
        stats.errorConnection++;
        console.log(`🔴 连接错误 - 请求${requestId} (${scenario}): ${err.code} - ${responseTime}ms`);
      } else {
        stats.otherErrors++;
        console.log(`🔴 请求错误 - 请求${requestId} (${scenario}): ${err.message} - ${responseTime}ms`);
      }
      
      resolve({
        requestId,
        scenario,
        error: true,
        errorType: err.code || 'UNKNOWN',
        errorMessage: err.message,
        responseTime,
        timestamp: Date.now()
      });
    });

    req.on('timeout', () => {
      stats.total++;
      stats.errorTimeout++;
      console.log(`⏰ 超时错误 - 请求${requestId} (${scenario}): ${TEST_CONFIG.timeout}ms`);
      req.destroy();
      
      resolve({
        requestId,
        scenario,
        error: true,
        errorType: 'TIMEOUT',
        responseTime: TEST_CONFIG.timeout,
        timestamp: Date.now()
      });
    });

    // 发送POST数据
    if (config.data) {
      req.write(config.data);
    }
    
    req.end();
  });
}

// 执行批量请求
async function runBatch(batchId, batchSize) {
  console.log(`\n🚀 开始批次 ${batchId + 1}/${TEST_CONFIG.concurrentBatches} (${batchSize}个请求)`);
  
  const scenarios = ['normal', 'withData', 'heavyHeaders', 'rapidFire'];
  const requests = [];
  
  for (let i = 0; i < batchSize; i++) {
    const requestId = `${batchId}-${i}`;
    const scenario = scenarios[i % scenarios.length];
    requests.push(makeRequest(requestId, scenario));
  }
  
  const results = await Promise.allSettled(requests);
  
  const batchStats = {
    total: results.length,
    success: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
    errors: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)).length
  };
  
  console.log(`✅ 批次 ${batchId + 1} 完成: ${batchStats.success}/${batchStats.total} 成功`);
  
  return results;
}

// 主测试函数
async function runHighConcurrencyTest() {
  console.log('🎯 开始高并发500错误测试');
  console.log(`📊 配置: ${TEST_CONFIG.totalRequests}个请求, ${TEST_CONFIG.concurrentBatches}个批次, 每批次${TEST_CONFIG.batchSize}个请求`);
  console.log(`🎯 目标: 检测间歇性500错误`);
  console.log(`⏱️  超时设置: ${TEST_CONFIG.timeout}ms\n`);
  
  stats.startTime = Date.now();
  
  // 执行所有批次
  const allBatches = [];
  for (let i = 0; i < TEST_CONFIG.concurrentBatches; i++) {
    allBatches.push(runBatch(i, TEST_CONFIG.batchSize));
  }
  
  // 等待所有批次完成
  await Promise.allSettled(allBatches);
  
  // 计算总耗时
  const totalTime = Date.now() - stats.startTime;
  const avgResponseTime = stats.responses
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / stats.responses.length;
  
  // 生成测试报告
  console.log('\n' + '='.repeat(60));
  console.log('📋 高并发测试报告');
  console.log('='.repeat(60));
  console.log(`📊 总请求数: ${stats.total}`);
  console.log(`✅ 成功请求: ${stats.success} (${(stats.success/stats.total*100).toFixed(1)}%)`);
  console.log(`🔴 500错误: ${stats.error500} (${(stats.error500/stats.total*100).toFixed(1)}%)`);
  console.log(`🟡 429限流: ${stats.error429} (${(stats.error429/stats.total*100).toFixed(1)}%)`);
  console.log(`⏰ 超时错误: ${stats.errorTimeout} (${(stats.errorTimeout/stats.total*100).toFixed(1)}%)`);
  console.log(`🔌 连接错误: ${stats.errorConnection} (${(stats.errorConnection/stats.total*100).toFixed(1)}%)`);
  console.log(`🟠 其他错误: ${stats.otherErrors} (${(stats.otherErrors/stats.total*100).toFixed(1)}%)`);
  console.log(`⏱️  总耗时: ${totalTime}ms`);
  console.log(`📈 平均响应时间: ${avgResponseTime.toFixed(1)}ms`);
  console.log(`🚀 请求速率: ${(stats.total / (totalTime / 1000)).toFixed(1)} req/s`);
  
  // 500错误详细分析
  if (stats.error500 > 0) {
    console.log('\n🔍 500错误详细分析:');
    const error500s = stats.responses.filter(r => r.statusCode === 500);
    error500s.forEach(err => {
      console.log(`  - 请求${err.requestId} (${err.scenario}): ${err.responseTime}ms`);
    });
  } else {
    console.log('\n✅ 未检测到500错误');
  }
  
  // 性能分析
  const slowRequests = stats.responses.filter(r => r.responseTime > 1000);
  if (slowRequests.length > 0) {
    console.log(`\n⚠️  慢请求 (>1s): ${slowRequests.length}个`);
    slowRequests.slice(0, 5).forEach(req => {
      console.log(`  - 请求${req.requestId} (${req.scenario}): ${req.responseTime}ms`);
    });
  }
  
  console.log('='.repeat(60));
  
  // 如果检测到500错误，建议下一步操作
  if (stats.error500 > 0) {
    console.log('\n🎯 检测到500错误！建议：');
    console.log('1. 检查服务器日志获取详细错误信息');
    console.log('2. 分析错误发生的请求模式');
    console.log('3. 检查数据库连接和异步操作');
  } else {
    console.log('\n💡 未复现500错误，可能需要：');
    console.log('1. 增加并发量或请求总数');
    console.log('2. 测试特定的API端点');
    console.log('3. 模拟数据库负载或网络延迟');
  }
}

// 运行测试
if (require.main === module) {
  runHighConcurrencyTest().catch(console.error);
}

module.exports = { runHighConcurrencyTest, TEST_CONFIG, stats };