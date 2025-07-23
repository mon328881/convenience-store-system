#!/usr/bin/env node

/**
 * MongoDB Atlas 连接测试脚本
 * 用于验证 MongoDB Atlas 数据库连接是否正常
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ 错误：未找到 MONGODB_URI 环境变量');
    console.log('请确保：');
    console.log('1. 已创建 .env 文件');
    console.log('2. 在 .env 文件中设置了 MONGODB_URI');
    console.log('3. MONGODB_URI 格式正确');
    process.exit(1);
}

console.log('🔄 正在测试 MongoDB Atlas 连接...');
console.log(`📍 连接地址：${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);

async function testConnection() {
    try {
        // 连接到 MongoDB
        await mongoose.connect(MONGODB_URI);
        
        console.log('✅ MongoDB Atlas 连接成功！');
        
        // 测试数据库操作
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log(`📊 数据库名称：${db.databaseName}`);
        console.log(`📁 集合数量：${collections.length}`);
        
        if (collections.length > 0) {
            console.log('📋 现有集合：');
            collections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
        } else {
            console.log('📋 数据库为空（这是正常的，首次使用时）');
        }
        
        // 测试写入操作
        console.log('🧪 测试写入操作...');
        const testCollection = db.collection('connection_test');
        const testDoc = {
            message: 'MongoDB Atlas 连接测试',
            timestamp: new Date(),
            version: '1.0.0'
        };
        
        const result = await testCollection.insertOne(testDoc);
        console.log(`✅ 测试文档写入成功，ID: ${result.insertedId}`);
        
        // 清理测试数据
        await testCollection.deleteOne({ _id: result.insertedId });
        console.log('🧹 测试数据已清理');
        
        console.log('\n🎉 MongoDB Atlas 配置完成！数据库可以正常使用。');
        
    } catch (error) {
        console.error('❌ MongoDB Atlas 连接失败：');
        console.error(error.message);
        
        // 提供常见错误的解决建议
        if (error.message.includes('authentication failed')) {
            console.log('\n💡 可能的解决方案：');
            console.log('1. 检查用户名和密码是否正确');
            console.log('2. 确保数据库用户有正确的权限');
            console.log('3. 检查连接字符串格式是否正确');
        } else if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
            console.log('\n💡 可能的解决方案：');
            console.log('1. 检查网络连接');
            console.log('2. 确保 IP 地址在 MongoDB Atlas 白名单中');
            console.log('3. 检查防火墙设置');
        } else if (error.message.includes('bad auth')) {
            console.log('\n💡 可能的解决方案：');
            console.log('1. 检查数据库用户名和密码');
            console.log('2. 确保用户已在 MongoDB Atlas 中创建');
            console.log('3. 检查用户权限设置');
        }
        
        process.exit(1);
    } finally {
        // 关闭连接
        await mongoose.connection.close();
        console.log('🔌 数据库连接已关闭');
    }
}

// 运行测试
testConnection();