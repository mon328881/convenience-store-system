#!/usr/bin/env node

// 测试腾讯云函数API连接
const https = require('https');

const API_BASE_URL = 'https://1371559131-0yd2evf4vy.ap-beijing.tencentscf.com';

console.log('🧪 测试腾讯云函数API连接');
console.log('================================');
console.log(`API地址: ${API_BASE_URL}`);
console.log('');

// 测试健康检查
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}/api/health`;
    console.log(`🔍 测试健康检查: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`✅ 健康检查成功: ${result.message}`);
          resolve(result);
        } catch (error) {
          console.log(`❌ 健康检查失败: ${error.message}`);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.log(`❌ 健康检查连接失败: ${error.message}`);
      reject(error);
    });
  });
}

// 测试商品列表
function testProductsList() {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}/api/products`;
    console.log(`🔍 测试商品列表: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`✅ 商品列表成功: 获取到 ${result.data.length} 个商品`);
          resolve(result);
        } catch (error) {
          console.log(`❌ 商品列表失败: ${error.message}`);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.log(`❌ 商品列表连接失败: ${error.message}`);
      reject(error);
    });
  });
}

// 测试供应商列表
function testSuppliersList() {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}/api/suppliers`;
    console.log(`🔍 测试供应商列表: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`✅ 供应商列表成功: 获取到 ${result.data.length} 个供应商`);
          resolve(result);
        } catch (error) {
          console.log(`❌ 供应商列表失败: ${error.message}`);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.log(`❌ 供应商列表连接失败: ${error.message}`);
      reject(error);
    });
  });
}

// 运行所有测试
async function runAllTests() {
  try {
    await testHealthCheck();
    console.log('');
    
    await testProductsList();
    console.log('');
    
    await testSuppliersList();
    console.log('');
    
    console.log('🎉 所有API测试通过！');
    console.log('');
    console.log('📋 API端点列表:');
    console.log(`- 健康检查: ${API_BASE_URL}/api/health`);
    console.log(`- 商品管理: ${API_BASE_URL}/api/products`);
    console.log(`- 供应商管理: ${API_BASE_URL}/api/suppliers`);
    console.log(`- 入库管理: ${API_BASE_URL}/api/inbound`);
    console.log(`- 出库管理: ${API_BASE_URL}/api/outbound`);
    console.log('');
    console.log('✅ 前端现在可以正常连接到腾讯云函数API了！');
    
  } catch (error) {
    console.log('');
    console.log('❌ API测试失败，请检查腾讯云函数配置');
    process.exit(1);
  }
}

runAllTests();