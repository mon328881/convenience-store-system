const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3000';
const CONCURRENT_REQUESTS = 10; // 每个端点的并发请求数
const ROUNDS = 3; // 测试轮数

// 测试端点列表
const endpoints = [
  // 基础端点
  { method: 'GET', url: '/', name: '根路径' },
  { method: 'GET', url: '/api/health', name: '健康检查' },
  
  // 产品相关端点（重点测试）
  { method: 'GET', url: '/api/products', name: '产品列表' },
  { method: 'GET', url: '/api/products?page=1&limit=10', name: '产品分页' },
  { method: 'GET', url: '/api/products?search=测试', name: '产品搜索' },
  { method: 'GET', url: '/api/products?category=食品', name: '产品分类筛选' },
  { method: 'GET', url: '/api/products?lowStock=true', name: '低库存产品' },
  { method: 'GET', url: '/api/products/stats', name: '产品统计' },
  { method: 'GET', url: '/api/products/123', name: '单个产品查询' },
  
  // 供应商端点
  { method: 'GET', url: '/api/suppliers', name: '供应商列表' },
  { method: 'GET', url: '/api/suppliers?page=1&limit=5', name: '供应商分页' },
  
  // 出入库端点
  { method: 'GET', url: '/api/inbound', name: '入库记录' },
  { method: 'GET', url: '/api/outbound', name: '出库记录' },
  
  // 报表端点
  { method: 'GET', url: '/api/reports/sales', name: '销售报表' },
  { method: 'GET', url: '/api/reports/inventory', name: '库存报表' },
  
  // 认证端点
  { method: 'GET', url: '/api/auth/profile', name: '用户资料' },
  { method: 'POST', url: '/api/auth/login', name: '用户登录', data: { username: 'test', password: 'test' } }
];

// 统计对象
const stats = {
  totalRequests: 0,
  successRequests: 0,
  errors: {
    500: 0,
    429: 0,
    404: 0,
    400: 0,
    timeout: 0,
    connection: 0,
    other: 0
  },
  responseTimes: [],
  slowRequests: 0,
  error500Details: []
};

// 发送单个请求
async function sendRequest(endpoint) {
  const startTime = Date.now();
  
  try {
    const config = {
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.url}`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Client/1.0'
      }
    };
    
    if (endpoint.data) {
      config.data = endpoint.data;
    }
    
    const response = await axios(config);
    const responseTime = Date.now() - startTime;
    
    stats.totalRequests++;
    stats.successRequests++;
    stats.responseTimes.push(responseTime);
    
    if (responseTime > 2000) {
      stats.slowRequests++;
    }
    
    return {
      success: true,
      status: response.status,
      responseTime,
      endpoint: endpoint.name
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    stats.totalRequests++;
    stats.responseTimes.push(responseTime);
    
    if (responseTime > 2000) {
      stats.slowRequests++;
    }
    
    let errorType = 'other';
    let status = 0;
    
    if (error.response) {
      status = error.response.status;
      if (status === 500) {
        errorType = '500';
        stats.error500Details.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          error: error.response.data?.message || error.message,
          timestamp: new Date().toISOString()
        });
      } else if (status === 429) {
        errorType = '429';
      } else if (status === 404) {
        errorType = '404';
      } else if (status === 400) {
        errorType = '400';
      }
    } else if (error.code === 'ECONNABORTED') {
      errorType = 'timeout';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorType = 'connection';
    }
    
    stats.errors[errorType]++;
    
    return {
      success: false,
      status,
      responseTime,
      endpoint: endpoint.name,
      error: error.response?.data?.message || error.message,
      errorType
    };
  }
}

// 测试单个端点
async function testEndpoint(endpoint, concurrency) {
  console.log(`\n测试端点: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
  console.log(`并发数: ${concurrency}`);
  
  const promises = [];
  for (let i = 0; i < concurrency; i++) {
    promises.push(sendRequest(endpoint));
  }
  
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const errors500 = results.filter(r => !r.success && r.status === 500).length;
  
  console.log(`结果: 成功 ${successful}/${concurrency}, 失败 ${failed}, 500错误 ${errors500}`);
  
  if (errors500 > 0) {
    console.log(`⚠️  发现 ${errors500} 个500错误!`);
    results.filter(r => !r.success && r.status === 500).forEach(r => {
      console.log(`   - ${r.error}`);
    });
  }
  
  return results;
}

// 主测试函数
async function runTest() {
  console.log('🚀 开始API端点500错误测试');
  console.log(`目标服务器: ${BASE_URL}`);
  console.log(`测试轮数: ${ROUNDS}`);
  console.log(`每端点并发数: ${CONCURRENT_REQUESTS}`);
  console.log(`总请求数: ${endpoints.length * CONCURRENT_REQUESTS * ROUNDS}`);
  console.log('=' * 60);
  
  const testStartTime = Date.now();
  
  for (let round = 1; round <= ROUNDS; round++) {
    console.log(`\n📊 第 ${round}/${ROUNDS} 轮测试`);
    console.log('-' * 40);
    
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint, CONCURRENT_REQUESTS);
      
      // 短暂延迟避免过度压力
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  const testDuration = Date.now() - testStartTime;
  
  // 生成测试报告
  console.log('\n' + '=' * 60);
  console.log('📈 测试报告');
  console.log('=' * 60);
  
  console.log(`\n📊 总体统计:`);
  console.log(`- 总请求数: ${stats.totalRequests}`);
  console.log(`- 成功请求: ${stats.successRequests} (${(stats.successRequests/stats.totalRequests*100).toFixed(1)}%)`);
  console.log(`- 失败请求: ${stats.totalRequests - stats.successRequests} (${((stats.totalRequests - stats.successRequests)/stats.totalRequests*100).toFixed(1)}%)`);
  console.log(`- 测试时长: ${(testDuration/1000).toFixed(1)}秒`);
  console.log(`- 平均请求速率: ${(stats.totalRequests/(testDuration/1000)).toFixed(1)} req/s`);
  
  console.log(`\n❌ 错误分类:`);
  console.log(`- 500错误: ${stats.errors['500']} (${(stats.errors['500']/stats.totalRequests*100).toFixed(1)}%)`);
  console.log(`- 429限流: ${stats.errors['429']} (${(stats.errors['429']/stats.totalRequests*100).toFixed(1)}%)`);
  console.log(`- 404未找到: ${stats.errors['404']} (${(stats.errors['404']/stats.totalRequests*100).toFixed(1)}%)`);
  console.log(`- 400错误请求: ${stats.errors['400']} (${(stats.errors['400']/stats.totalRequests*100).toFixed(1)}%)`);
  console.log(`- 超时错误: ${stats.errors['timeout']} (${(stats.errors['timeout']/stats.totalRequests*100).toFixed(1)}%)`);
  console.log(`- 连接错误: ${stats.errors['connection']} (${(stats.errors['connection']/stats.totalRequests*100).toFixed(1)}%)`);
  console.log(`- 其他错误: ${stats.errors['other']} (${(stats.errors['other']/stats.totalRequests*100).toFixed(1)}%)`);
  
  if (stats.responseTimes.length > 0) {
    const avgResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
    const maxResponseTime = Math.max(...stats.responseTimes);
    const minResponseTime = Math.min(...stats.responseTimes);
    
    console.log(`\n⏱️  响应时间统计:`);
    console.log(`- 平均响应时间: ${avgResponseTime.toFixed(1)}ms`);
    console.log(`- 最大响应时间: ${maxResponseTime}ms`);
    console.log(`- 最小响应时间: ${minResponseTime}ms`);
    console.log(`- 慢请求(>2s): ${stats.slowRequests} (${(stats.slowRequests/stats.totalRequests*100).toFixed(1)}%)`);
  }
  
  // 500错误详细分析
  if (stats.error500Details.length > 0) {
    console.log(`\n🚨 500错误详细分析:`);
    console.log(`发现 ${stats.error500Details.length} 个500错误:`);
    
    // 按端点分组
    const errorsByEndpoint = {};
    stats.error500Details.forEach(error => {
      if (!errorsByEndpoint[error.endpoint]) {
        errorsByEndpoint[error.endpoint] = [];
      }
      errorsByEndpoint[error.endpoint].push(error);
    });
    
    Object.entries(errorsByEndpoint).forEach(([endpoint, errors]) => {
      console.log(`\n  📍 ${endpoint} (${errors.length}个错误):`);
      errors.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error.error}`);
        console.log(`       URL: ${error.url}`);
        console.log(`       时间: ${error.timestamp}`);
      });
    });
    
    console.log(`\n💡 建议:`);
    console.log(`- 检查产品相关API的数据库查询逻辑`);
    console.log(`- 确认Supabase连接和查询语法`);
    console.log(`- 查看服务器错误日志获取更多详情`);
  } else {
    console.log(`\n✅ 好消息: 未发现500错误!`);
    console.log(`所有API端点都正常响应，没有出现服务器内部错误。`);
  }
  
  console.log('\n' + '=' * 60);
  console.log('测试完成');
  console.log('=' * 60);
}

// 运行测试
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { runTest, sendRequest, testEndpoint };