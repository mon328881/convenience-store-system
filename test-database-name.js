#!/usr/bin/env node

/**
 * 简化的MongoDB连接测试 - 专注于数据库名称问题
 */

const mongoose = require('mongoose');

async function testDatabaseConnection() {
    console.log('🔍 MongoDB数据库名称问题诊断');
    console.log('=' * 40);
    
    // 测试1: 连接到test数据库（当前本地成功的配置）
    console.log('\n📋 测试1: 连接到test数据库');
    try {
        const testConnection = await mongoose.createConnection(
            'mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            }
        );
        
        console.log(`✅ test数据库连接成功`);
        console.log(`📁 数据库名: ${testConnection.name}`);
        
        // 列出集合
        const collections = await testConnection.db.listCollections().toArray();
        console.log(`📋 集合数量: ${collections.length}`);
        if (collections.length > 0) {
            console.log(`📄 集合列表: ${collections.map(c => c.name).join(', ')}`);
        }
        
        await testConnection.close();
        
    } catch (error) {
        console.error(`❌ test数据库连接失败:`, error.message);
    }
    
    // 测试2: 连接到convenience_store数据库（腾讯云函数期望的）
    console.log('\n📋 测试2: 连接到convenience_store数据库');
    try {
        const storeConnection = await mongoose.createConnection(
            'mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            }
        );
        
        console.log(`✅ convenience_store数据库连接成功`);
        console.log(`📁 数据库名: ${storeConnection.name}`);
        
        // 列出集合
        const collections = await storeConnection.db.listCollections().toArray();
        console.log(`📋 集合数量: ${collections.length}`);
        if (collections.length > 0) {
            console.log(`📄 集合列表: ${collections.map(c => c.name).join(', ')}`);
        } else {
            console.log(`📄 数据库为空（这是正常的，首次使用时）`);
        }
        
        // 测试创建集合和文档
        console.log('\n🧪 测试在convenience_store数据库中创建数据...');
        
        const TestSchema = new mongoose.Schema({
            name: String,
            test: { type: Boolean, default: true },
            createdAt: { type: Date, default: Date.now }
        });
        
        const TestModel = storeConnection.model('TestCollection', TestSchema);
        const testDoc = new TestModel({ name: '连接测试' });
        await testDoc.save();
        
        console.log(`✅ 文档创建成功! ID: ${testDoc._id}`);
        
        // 验证读取
        const savedDoc = await TestModel.findById(testDoc._id);
        console.log(`✅ 文档读取成功! 名称: ${savedDoc.name}`);
        
        // 清理
        await TestModel.findByIdAndDelete(testDoc._id);
        console.log(`🧹 测试数据已清理`);
        
        await storeConnection.close();
        
    } catch (error) {
        console.error(`❌ convenience_store数据库连接失败:`, error.message);
    }
    
    console.log('\n🎯 关键发现:');
    console.log('1. 本地可以成功连接到MongoDB Atlas');
    console.log('2. 问题可能在于腾讯云函数的环境变量配置');
    console.log('3. 确保MONGODB_URI包含正确的数据库名称');
    
    console.log('\n🔧 推荐的腾讯云函数环境变量:');
    console.log('MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0');
    console.log('JWT_SECRET=your-32-character-secret-key-here');
    console.log('NODE_ENV=production');
}

testDatabaseConnection().catch(console.error);