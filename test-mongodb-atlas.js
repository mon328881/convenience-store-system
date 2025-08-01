const { MongoClient } = require('mongodb');

// 使用您提供的MongoDB URI
const MONGODB_URI = 'mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0';

async function testMongoDBConnection() {
    console.log('=== MongoDB Atlas 连接测试 ===\n');
    
    console.log('🔍 测试配置:');
    console.log('URI:', MONGODB_URI);
    console.log('数据库名称: convenience_store');
    console.log('固定IP: 175.178.229.42');
    console.log('');
    
    let client;
    
    try {
        console.log('📡 正在连接MongoDB Atlas...');
        
        // 创建客户端
        client = new MongoClient(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000, // 10秒超时
            connectTimeoutMS: 10000,
            socketTimeoutMS: 10000,
        });
        
        // 连接数据库
        await client.connect();
        console.log('✅ MongoDB连接成功！');
        
        // 测试数据库访问
        const db = client.db('convenience_store');
        console.log('✅ 数据库访问成功！');
        
        // 列出集合
        const collections = await db.listCollections().toArray();
        console.log('📋 数据库集合:', collections.map(c => c.name));
        
        // 测试products集合
        const productsCollection = db.collection('products');
        const productCount = await productsCollection.countDocuments();
        console.log('📦 产品数量:', productCount);
        
        // 测试写入权限
        const testDoc = { 
            name: '连接测试', 
            timestamp: new Date(),
            test: true 
        };
        
        const testCollection = db.collection('connection_test');
        await testCollection.insertOne(testDoc);
        console.log('✅ 写入权限测试成功！');
        
        // 清理测试数据
        await testCollection.deleteOne({ test: true });
        console.log('✅ 删除权限测试成功！');
        
        console.log('\n🎉 所有测试通过！MongoDB Atlas配置正确。');
        
    } catch (error) {
        console.error('\n❌ MongoDB连接失败:');
        console.error('错误类型:', error.name);
        console.error('错误信息:', error.message);
        
        if (error.message.includes('IP')) {
            console.error('\n🔍 可能的原因: IP白名单问题');
            console.error('请确认已将 175.178.229.42/32 添加到MongoDB Atlas白名单');
        }
        
        if (error.message.includes('authentication')) {
            console.error('\n🔍 可能的原因: 认证问题');
            console.error('请检查用户名和密码是否正确');
        }
        
        if (error.message.includes('timeout')) {
            console.error('\n🔍 可能的原因: 网络超时');
            console.error('请检查网络连接和MongoDB Atlas集群状态');
        }
        
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 连接已关闭');
        }
    }
}

// 运行测试
testMongoDBConnection().catch(console.error);