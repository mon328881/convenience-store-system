#!/usr/bin/env node

/**
 * 腾讯云函数MongoDB连接问题修复脚本
 * 
 * 问题分析：
 * 1. 数据库名称不匹配（本地test vs 云函数convenience_store）
 * 2. 超时配置可能不够
 * 3. 腾讯云函数网络环境限制
 */

const mongoose = require('mongoose');

// 测试不同的MongoDB连接配置
const testConfigurations = [
    {
        name: '标准配置（指定数据库名）',
        uri: 'mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 10000,  // 增加到10秒
            socketTimeoutMS: 60000,           // 增加到60秒
            connectTimeoutMS: 10000,          // 连接超时10秒
            heartbeatFrequencyMS: 10000,      // 心跳频率
            maxIdleTimeMS: 30000,             // 最大空闲时间
        }
    },
    {
        name: '宽松超时配置',
        uri: 'mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 3,                   // 减少连接池大小
            serverSelectionTimeoutMS: 15000, // 更长的服务器选择超时
            socketTimeoutMS: 90000,           // 更长的socket超时
            connectTimeoutMS: 15000,          // 更长的连接超时
            heartbeatFrequencyMS: 15000,      // 更长的心跳间隔
            maxIdleTimeMS: 60000,             // 更长的空闲时间
            retryWrites: true,
            retryReads: true,
        }
    },
    {
        name: '腾讯云函数优化配置',
        uri: 'mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0&ssl=true',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 2,                   // 云函数环境使用更小的连接池
            serverSelectionTimeoutMS: 20000, // 云函数网络可能较慢
            socketTimeoutMS: 120000,          // 2分钟socket超时
            connectTimeoutMS: 20000,          // 20秒连接超时
            heartbeatFrequencyMS: 20000,      // 20秒心跳
            maxIdleTimeMS: 120000,            // 2分钟空闲时间
            retryWrites: true,
            retryReads: true,
        }
    }
];

async function testConnection(config) {
    console.log(`\n🔄 测试配置: ${config.name}`);
    console.log(`📍 连接URI: ${config.uri.replace(/\/\/.*:.*@/, '//***:***@')}`);
    
    let connection;
    try {
        const startTime = Date.now();
        
        // 创建新的连接
        connection = await mongoose.createConnection(config.uri, config.options);
        
        const connectTime = Date.now() - startTime;
        console.log(`✅ 连接成功! 耗时: ${connectTime}ms`);
        
        // 测试数据库操作
        const testStart = Date.now();
        
        // 列出集合
        const collections = await connection.db.listCollections().toArray();
        console.log(`📁 数据库: ${connection.name}`);
        console.log(`📋 集合数量: ${collections.length}`);
        
        // 测试写入操作
        const TestSchema = new mongoose.Schema({
            test: String,
            timestamp: { type: Date, default: Date.now }
        });
        
        const TestModel = connection.model('ConnectionTest', TestSchema);
        const testDoc = new TestModel({ test: 'connection-test' });
        await testDoc.save();
        
        // 测试读取操作
        const savedDoc = await TestModel.findById(testDoc._id);
        console.log(`✅ 读写测试成功! 文档ID: ${savedDoc._id}`);
        
        // 清理测试数据
        await TestModel.findByIdAndDelete(testDoc._id);
        console.log(`🧹 测试数据已清理`);
        
        const operationTime = Date.now() - testStart;
        console.log(`⚡ 数据库操作耗时: ${operationTime}ms`);
        
        return {
            success: true,
            connectTime,
            operationTime,
            config: config.name
        };
        
    } catch (error) {
        console.error(`❌ 连接失败:`, error.message);
        
        // 详细错误分析
        if (error.message.includes('timeout')) {
            console.log(`⏰ 超时错误 - 建议增加超时时间或检查网络`);
        }
        if (error.message.includes('authentication')) {
            console.log(`🔐 认证错误 - 检查用户名密码`);
        }
        if (error.message.includes('network')) {
            console.log(`🌐 网络错误 - 检查网络连接和防火墙`);
        }
        
        return {
            success: false,
            error: error.message,
            config: config.name
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function main() {
    console.log('🔧 腾讯云函数MongoDB连接问题诊断工具');
    console.log('=' * 50);
    
    const results = [];
    
    for (const config of testConfigurations) {
        const result = await testConnection(config);
        results.push(result);
        
        // 等待一秒避免连接过于频繁
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 测试结果汇总:');
    console.log('=' * 50);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
        console.log(`✅ 成功配置 (${successful.length}个):`);
        successful.forEach(result => {
            console.log(`  - ${result.config}: 连接${result.connectTime}ms, 操作${result.operationTime}ms`);
        });
        
        // 推荐最佳配置
        const fastest = successful.reduce((prev, current) => 
            (prev.connectTime + prev.operationTime) < (current.connectTime + current.operationTime) ? prev : current
        );
        console.log(`\n🏆 推荐配置: ${fastest.config}`);
    }
    
    if (failed.length > 0) {
        console.log(`\n❌ 失败配置 (${failed.length}个):`);
        failed.forEach(result => {
            console.log(`  - ${result.config}: ${result.error}`);
        });
    }
    
    console.log('\n💡 修复建议:');
    console.log('1. 确保MONGODB_URI包含正确的数据库名称: convenience_store');
    console.log('2. 增加超时配置以适应腾讯云函数网络环境');
    console.log('3. 考虑使用VPC配置提高网络稳定性');
    console.log('4. 监控MongoDB Atlas的连接数限制');
    
    console.log('\n🔧 环境变量配置示例:');
    console.log('MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0');
}

// 运行测试
main().catch(console.error);