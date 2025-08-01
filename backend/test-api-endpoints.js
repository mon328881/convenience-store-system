const http = require('http');

// API端点测试配置
const TEST_CONFIG = {
  host: 'localhost',
  port: 3000,
  timeout: 10000,
  concurrentRequests: 20,
  totalRounds: 5
};

// 测试统计
const stats = {
  total: 0,
  success: 0,
  error500: 0,
  error429: 0,
  error404: 0,
  error400: 0,
  otherErrors: 0,
  timeouts: 0,
  connectionErrors: 0,
  responses: [],
  error500Details: []
};

// API端点配置
const API_ENDPOINTS = [
  // 基础端点
  { method: 'GET', path: '/', name: '根路径', category: 'basic' },
  { method: 'GET', path: '/health', name: '健康检查', category: 'basic' },
  
  // 供应商API
  { method: 'GET', path: '/api/suppliers', name: '获取供应商列表', category: 'suppliers' },
  { method: 'POST', path: '/api/suppliers', name: '创建供应商', category: 'suppliers', 
    data: { name: '测试供应商', contact: '测试联系人', phone: '13800138000', address: '测试地址' } },
  { method: 'GET', path: '/api/suppliers/1', name: '获取单个供应商', category: 'suppliers' },
  { method: 'PUT', path: '/api/suppliers/1', name: '更新供应商', category: 'suppliers',
    data: { name: '更新供应商', contact: '更新联系人' } },
  
  // 产品API
  { method: 'GET', path: '/api/products', name: '获取产品列表', category: 'products' },
  { method: 'GET', path: '/api/products/stats', name: '获取产品统计', category: 'products' },
  { method: 'POST', path: '/api/products', name: '创建产品', category: 'products',
    data: { name: '测试产品', barcode: 'TEST001', price: 10.00, cost: 5.00, category: '测试分类' } },
  { method: 'GET', path: '/api/products/1', name: '获取单个产品', category: 'products' },
  { method: 'PUT', path: '/api/products/1', name: '更新产品', category: 'products',
    data: { name: '更新产品', price: 15.00 } },
  
  // 入库API
  { method: 'GET', path: '/api/inbound', name: '获取入库记录', category: 'inbound' },
  { method: 'POST', path: '/api/inbound', name: '创建入库记录', category: 'inbound',
    data: { productId: 1, supplierId: 1, quantity: 100, unitCost: 5.00, totalCost: 500.00 } },
  { method: 'GET', path: '/api/inbound/1', name: '获取单个入库记录', category: 'inbound' },
  
  // 出库API
  { method: 'GET', path: '/api/outbound', name: '获取出库记录', category: 'outbound' },
  { method: 'POST', path: '/api/outbound', name: '创建出库记录', category: 'outbound',
    data: { productId: 1, quantity: 10, unitPrice: 10.00, totalPrice: 100.00, reason: '销售' } },
  { method: 'GET', path: '/api/outbound/1', name: '获取单个出库记录', category: 'outbound' },
  
  // 报表API
  { method: 'GET', path: '/api/reports/summary', name: '获取汇总报表', category: 'reports' },
  { method: 'GET', path: '/api/reports/inventory', name: '获取库存报表', category: 'reports' },
  { method: 'GET', path: '/api/reports/sales', name: '获取销售报表', category: 'reports' },
  
  // 认证API
  { method: 'POST', path: '/api/auth/login', name: '用户登录', category: 'auth',
    data: { username: 'test', password: 'test123' } },
  { method: 'GET', path: '/api/auth/user', name: '获取用户信息', category: 'auth' },
  
  // 边界测试
  { method: 'GET', path: '/api/products?page=999&limit=1000', name: '大分页查询', category: 'boundary' },
  { method: 'GET', path: '/api/suppliers?search=' + 'A'.repeat(1000), name: '长搜索字符串', category: 'boundary' },
  { method: 'POST', path: '/api/products', name: '无效数据创建', category: 'boundary',
    data: { invalid: 'data' } },
];

// 创建HTTP请求
function makeRequest(endpoint, requestId) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: TEST_CONFIG.host,
      port: TEST_CONFIG.port,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `API-Test/${requestId}`,
        'Accept': 'application/json',
        'X-Test-Request': 'true'
      },
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
          endpoint: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          category: endpoint.category,
          statusCode: res.statusCode,
          responseTime,
          success: res.statusCode >= 200 && res.statusCode < 300,
          timestamp: endTime,
          responseData: data.substring(0, 500) // 限制响应数据长度
        };
        
        // 更新统计
        stats.total++;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          stats.success++;
        } else if (res.statusCode === 500) {
          stats.error500++;
          stats.error500Details.push({
            endpoint: endpoint.name,
            path: endpoint.path,
            method: endpoint.method,
            requestId,
            responseTime,
            responseData: data
          });
          console.log(`🔴 500错误 - ${endpoint.name} (${endpoint.method} ${endpoint.path}): ${responseTime}ms`);
        } else if (res.statusCode === 429) {
          stats.error429++;
          console.log(`🟡 429限流 - ${endpoint.name}: ${responseTime}ms`);
        } else if (res.statusCode === 404) {
          stats.error404++;
          console.log(`🟠 404未找到 - ${endpoint.name}: ${responseTime}ms`);
        } else if (res.statusCode === 400) {
          stats.error400++;
          console.log(`🟠 400错误请求 - ${endpoint.name}: ${responseTime}ms`);
        } else {
          stats.otherErrors++;
          console.log(`🟠 其他错误 - ${endpoint.name}: ${res.statusCode} - ${responseTime}ms`);
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
        stats.connectionErrors++;
        console.log(`🔴 连接错误 - ${endpoint.name}: ${err.code} - ${responseTime}ms`);
      } else {
        stats.otherErrors++;
        console.log(`🔴 请求错误 - ${endpoint.name}: ${err.message} - ${responseTime}ms`);
      }
      
      resolve({
        requestId,
        endpoint: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        category: endpoint.category,
        error: true,
        errorType: err.code || 'UNKNOWN',
        errorMessage: err.message,
        responseTime,
        timestamp: Date.now()
      });
    });

    req.on('timeout', () => {
      stats.total++;
      stats.timeouts++;
      console.log(`⏰ 超时 - ${endpoint.name}: ${TEST_CONFIG.timeout}ms`);
      req.destroy();
      
      resolve({
        requestId,
        endpoint: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        category: endpoint.category,
        error: true,
        errorType: 'TIMEOUT',
        responseTime: TEST_CONFIG.timeout,
        timestamp: Date.now()
      });
    });

    // 发送POST数据
    if (endpoint.data) {
      req.write(JSON.stringify(endpoint.data));
    }
    
    req.end();
  });
}

// 执行单轮测试
async function runTestRound(roundId) {
  console.log(`\n🚀 开始第 ${roundId + 1}/${TEST_CONFIG.totalRounds} 轮测试`);
  
  const requests = [];
  
  // 为每个端点创建多个并发请求
  API_ENDPOINTS.forEach((endpoint, index) => {
    for (let i = 0; i < TEST_CONFIG.concurrentRequests; i++) {
      const requestId = `R${roundId}-E${index}-${i}`;
      requests.push(makeRequest(endpoint, requestId));
    }
  });
  
  console.log(`📊 本轮将发送 ${requests.length} 个请求`);
  
  // 并发执行所有请求
  const results = await Promise.allSettled(requests);
  
  const roundStats = {
    total: results.length,
    success: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
    errors: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)).length
  };
  
  console.log(`✅ 第 ${roundId + 1} 轮完成: ${roundStats.success}/${roundStats.total} 成功`);
  
  return results;
}

// 主测试函数
async function runAPIEndpointsTest() {
  console.log('🎯 开始API端点500错误测试');
  console.log(`📊 配置: ${API_ENDPOINTS.length}个端点, ${TEST_CONFIG.totalRounds}轮测试, 每端点${TEST_CONFIG.concurrentRequests}个并发请求`);
  console.log(`🎯 总请求数: ${API_ENDPOINTS.length * TEST_CONFIG.concurrentRequests * TEST_CONFIG.totalRounds}`);
  console.log(`⏱️  超时设置: ${TEST_CONFIG.timeout}ms\n`);
  
  const startTime = Date.now();
  
  // 执行所有轮次
  for (let round = 0; round < TEST_CONFIG.totalRounds; round++) {
    await runTestRound(round);
    
    // 轮次间短暂休息
    if (round < TEST_CONFIG.totalRounds - 1) {
      console.log('⏸️  轮次间休息 1 秒...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 计算总耗时
  const totalTime = Date.now() - startTime;
  const avgResponseTime = stats.responses
    .filter(r => r.responseTime && !r.error)
    .reduce((sum, r) => sum + r.responseTime, 0) / stats.responses.filter(r => !r.error).length;
  
  // 生成测试报告
  console.log('\n' + '='.repeat(80));
  console.log('📋 API端点测试报告');
  console.log('='.repeat(80));
  console.log(`📊 总请求数: ${stats.total}`);
  console.log(`✅ 成功请求: ${stats.success} (${(stats.success/stats.total*100).toFixed(1)}%)`);
  console.log(`🔴 500错误: ${stats.error500} (${(stats.error500/stats.total*100).toFixed(1)}%)`);
  console.log(`🟡 429限流: ${stats.error429} (${(stats.error429/stats.total*100).toFixed(1)}%)`);
  console.log(`🟠 404未找到: ${stats.error404} (${(stats.error404/stats.total*100).toFixed(1)}%)`);
  console.log(`🟠 400错误请求: ${stats.error400} (${(stats.error400/stats.total*100).toFixed(1)}%)`);
  console.log(`⏰ 超时错误: ${stats.timeouts} (${(stats.timeouts/stats.total*100).toFixed(1)}%)`);
  console.log(`🔌 连接错误: ${stats.connectionErrors} (${(stats.connectionErrors/stats.total*100).toFixed(1)}%)`);
  console.log(`🟠 其他错误: ${stats.otherErrors} (${(stats.otherErrors/stats.total*100).toFixed(1)}%)`);
  console.log(`⏱️  总耗时: ${totalTime}ms`);
  console.log(`📈 平均响应时间: ${avgResponseTime ? avgResponseTime.toFixed(1) : 'N/A'}ms`);
  console.log(`🚀 请求速率: ${(stats.total / (totalTime / 1000)).toFixed(1)} req/s`);
  
  // 500错误详细分析
  if (stats.error500 > 0) {
    console.log('\n🔍 500错误详细分析:');
    stats.error500Details.forEach((err, index) => {
      console.log(`  ${index + 1}. ${err.endpoint} (${err.method} ${err.path})`);
      console.log(`     请求ID: ${err.requestId}, 响应时间: ${err.responseTime}ms`);
      if (err.responseData) {
        console.log(`     响应数据: ${err.responseData.substring(0, 200)}...`);
      }
    });
  } else {
    console.log('\n✅ 未检测到500错误');
  }
  
  // 按分类统计
  console.log('\n📊 按分类统计:');
  const categories = {};
  stats.responses.forEach(r => {
    if (!categories[r.category]) {
      categories[r.category] = { total: 0, success: 0, error500: 0 };
    }
    categories[r.category].total++;
    if (r.success) categories[r.category].success++;
    if (r.statusCode === 500) categories[r.category].error500++;
  });
  
  Object.entries(categories).forEach(([category, stats]) => {
    console.log(`  ${category}: ${stats.success}/${stats.total} 成功, ${stats.error500} 个500错误`);
  });
  
  // 慢请求分析
  const slowRequests = stats.responses.filter(r => r.responseTime > 2000 && !r.error);
  if (slowRequests.length > 0) {
    console.log(`\n⚠️  慢请求 (>2s): ${slowRequests.length}个`);
    slowRequests.slice(0, 5).forEach(req => {
      console.log(`  - ${req.endpoint}: ${req.responseTime}ms`);
    });
  }
  
  console.log('='.repeat(80));
  
  // 建议
  if (stats.error500 > 0) {
    console.log('\n🎯 检测到500错误！建议：');
    console.log('1. 检查服务器日志获取详细错误信息');
    console.log('2. 分析错误发生的API端点模式');
    console.log('3. 检查数据库连接和数据完整性');
    console.log('4. 验证API参数和数据格式');
  } else {
    console.log('\n💡 未复现500错误，可能原因：');
    console.log('1. 错误是间歇性的，需要更长时间测试');
    console.log('2. 错误需要特定的数据状态触发');
    console.log('3. 错误与并发量或系统负载相关');
    console.log('4. 错误与特定的用户会话或认证状态相关');
  }
}

// 运行测试
if (require.main === module) {
  runAPIEndpointsTest().catch(console.error);
}

module.exports = { runAPIEndpointsTest, API_ENDPOINTS, TEST_CONFIG, stats };