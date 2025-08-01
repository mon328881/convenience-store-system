const http = require('http');
const { URL } = require('url');

// 测试配置
const BASE_URL = 'http://localhost:3000';
const TEST_SCENARIOS = [
  {
    name: '正常根路径请求',
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Connection': 'keep-alive'
    }
  },
  {
    name: '带异常头的请求',
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Test-Agent/1.0',
      'Accept': 'application/json',
      'X-Test-Header': 'test-value',
      'Content-Type': 'application/json',
      'Connection': 'close'
    }
  },
  {
    name: 'POST请求到根路径',
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Test-Client/1.0'
    },
    body: JSON.stringify({ test: 'data' })
  },
  {
    name: '大量请求头',
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Test-Agent/1.0',
      'Accept': 'application/json, text/html, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'X-Custom-Header-1': 'value1',
      'X-Custom-Header-2': 'value2',
      'X-Custom-Header-3': 'value3',
      'Connection': 'keep-alive'
    }
  },
  {
    name: '快速连续请求',
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Rapid-Test/1.0',
      'Accept': 'application/json'
    },
    rapid: true
  }
];

// 发送HTTP请求的Promise包装
function makeRequest(scenario) {
  return new Promise((resolve, reject) => {
    const url = new URL(scenario.path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: scenario.method,
      headers: scenario.headers,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          scenario: scenario.name,
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          success: res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      reject({
        scenario: scenario.name,
        error: error.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        scenario: scenario.name,
        error: 'Request timeout',
        success: false
      });
    });

    if (scenario.body) {
      req.write(scenario.body);
    }
    
    req.end();
  });
}

// 执行单个测试场景
async function runScenario(scenario, count = 1) {
  console.log(`\n🧪 测试场景: ${scenario.name}`);
  console.log(`📊 请求数量: ${count}`);
  
  const results = {
    total: count,
    success: 0,
    errors: 0,
    status500: 0,
    status429: 0,
    otherErrors: 0,
    responses: []
  };

  const promises = [];
  
  if (scenario.rapid) {
    // 快速连续请求
    for (let i = 0; i < count; i++) {
      promises.push(makeRequest(scenario));
      // 极短间隔
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
  } else {
    // 并发请求
    for (let i = 0; i < count; i++) {
      promises.push(makeRequest(scenario));
    }
  }

  try {
    const responses = await Promise.allSettled(promises);
    
    responses.forEach((response, index) => {
      if (response.status === 'fulfilled') {
        const result = response.value;
        results.responses.push(result);
        
        if (result.success) {
          results.success++;
        } else {
          results.errors++;
          if (result.statusCode === 500) {
            results.status500++;
            console.log(`❌ 发现500错误! 请求 #${index + 1}`);
            console.log(`   状态码: ${result.statusCode}`);
            console.log(`   响应体: ${result.body.substring(0, 200)}...`);
          } else if (result.statusCode === 429) {
            results.status429++;
          } else {
            results.otherErrors++;
          }
        }
      } else {
        const error = response.reason;
        results.responses.push(error);
        results.errors++;
        results.otherErrors++;
        console.log(`❌ 请求失败 #${index + 1}: ${error.error}`);
      }
    });
    
  } catch (error) {
    console.error(`❌ 测试场景执行失败: ${error.message}`);
  }

  // 输出结果统计
  console.log(`\n📈 测试结果:`);
  console.log(`   ✅ 成功: ${results.success}/${results.total}`);
  console.log(`   ❌ 失败: ${results.errors}/${results.total}`);
  console.log(`   🔥 500错误: ${results.status500}`);
  console.log(`   ⏰ 429限流: ${results.status429}`);
  console.log(`   🔧 其他错误: ${results.otherErrors}`);

  return results;
}

// 主测试函数
async function runAsyncErrorTest() {
  console.log('🚀 开始异步错误测试');
  console.log(`🎯 目标服务器: ${BASE_URL}`);
  console.log(`📅 测试时间: ${new Date().toISOString()}`);
  
  const allResults = [];
  
  // 测试每个场景
  for (const scenario of TEST_SCENARIOS) {
    try {
      const result = await runScenario(scenario, 20);
      allResults.push(result);
      
      // 如果发现500错误，立即停止并报告
      if (result.status500 > 0) {
        console.log(`\n🎯 发现500错误! 在场景: ${scenario.name}`);
        console.log(`🔍 500错误数量: ${result.status500}`);
        break;
      }
      
      // 场景间延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ 场景 "${scenario.name}" 执行失败:`, error.message);
    }
  }
  
  // 总结报告
  console.log(`\n📊 总体测试报告:`);
  console.log(`🧪 测试场景数: ${allResults.length}`);
  
  let totalRequests = 0;
  let totalSuccess = 0;
  let total500Errors = 0;
  let total429Errors = 0;
  
  allResults.forEach(result => {
    totalRequests += result.total;
    totalSuccess += result.success;
    total500Errors += result.status500;
    total429Errors += result.status429;
  });
  
  console.log(`📈 总请求数: ${totalRequests}`);
  console.log(`✅ 总成功数: ${totalSuccess}`);
  console.log(`🔥 总500错误: ${total500Errors}`);
  console.log(`⏰ 总429错误: ${total429Errors}`);
  console.log(`📊 成功率: ${((totalSuccess / totalRequests) * 100).toFixed(2)}%`);
  
  if (total500Errors > 0) {
    console.log(`\n🎯 成功复现500错误! 错误数量: ${total500Errors}`);
    console.log(`💡 建议检查服务器日志以获取详细错误信息`);
  } else {
    console.log(`\n✅ 未能复现500错误，服务器运行正常`);
    console.log(`💡 可能需要其他触发条件或更高的并发量`);
  }
}

// 运行测试
if (require.main === module) {
  runAsyncErrorTest().catch(console.error);
}

module.exports = { runAsyncErrorTest, makeRequest, runScenario };