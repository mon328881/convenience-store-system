const mongoose = require('mongoose');

// MongoDB连接配置
const MONGODB_CONFIGS = [
    {
        name: "当前配置",
        uri: "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/"
    },
    {
        name: "优化配置1 - 基础重试",
        uri: "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority"
    },
    {
        name: "优化配置2 - 添加超时",
        uri: "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?serverSelectionTimeoutMS=10000&connectTimeoutMS=15000"
    },
    {
        name: "优化配置3 - 完整参数（推荐）",
        uri: "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=15000"
    },
    {
        name: "优化配置4 - 最大兼容性",
        uri: "mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=15000&maxPoolSize=10&minPoolSize=1"
    }
];

async function testMongoConnection(config) {
    console.log(`\n🧪 测试: ${config.name}`);
    console.log(`📝 URI: ${config.uri}`);
    console.log('⏳ 连接中...');
    
    const startTime = Date.now();
    
    try {
        // 创建新的连接
        const connection = await mongoose.createConnection(config.uri);
        
        // 等待连接建立
        await new Promise((resolve, reject) => {
            connection.once('connected', resolve);
            connection.once('error', reject);
            // 如果连接已经建立，立即resolve
            if (connection.readyState === 1) {
                resolve();
            }
        });
        
        // 测试连接
        await connection.db.admin().ping();
        
        const duration = Date.now() - startTime;
        console.log(`✅ 连接成功! 耗时: ${duration}ms`);
        
        // 获取数据库信息
        const dbName = connection.db.databaseName;
        console.log(`📊 数据库名称: ${dbName}`);
        
        // 列出集合
        const collections = await connection.db.listCollections().toArray();
        console.log(`📁 集合数量: ${collections.length}`);
        if (collections.length > 0) {
            console.log(`📋 集合列表: ${collections.map(c => c.name).join(', ')}`);
        }
        
        // 关闭连接
        await connection.close();
        
        return { success: true, duration, dbName, collections: collections.length };
        
    } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`❌ 连接失败! 耗时: ${duration}ms`);
        console.log(`🔍 错误类型: ${error.name}`);
        console.log(`📝 错误信息: ${error.message}`);
        
        if (error.reason) {
            console.log(`🎯 详细原因: ${error.reason.type}`);
            if (error.reason.servers) {
                console.log(`🖥️  服务器状态:`);
                error.reason.servers.forEach((server, host) => {
                    console.log(`   - ${host}: ${server.type || 'Unknown'}`);
                });
            }
        }
        
        return { success: false, duration, error: error.message };
    }
}

async function main() {
    console.log('🔍 MongoDB Atlas 本地连接测试');
    console.log('================================');
    console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
    
    const results = [];
    
    for (const config of MONGODB_CONFIGS) {
        const result = await testMongoConnection(config);
        results.push({ config: config.name, ...result });
        
        // 等待一秒再测试下一个配置
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 测试结果汇总');
    console.log('================');
    
    results.forEach((result, index) => {
        const status = result.success ? '✅ 成功' : '❌ 失败';
        console.log(`${index + 1}. ${result.config}: ${status} (${result.duration}ms)`);
    });
    
    const successfulConfigs = results.filter(r => r.success);
    
    if (successfulConfigs.length > 0) {
        console.log('\n🎉 推荐使用的配置:');
        const fastest = successfulConfigs.reduce((prev, current) => 
            prev.duration < current.duration ? prev : current
        );
        console.log(`⚡ 最快连接: ${fastest.config} (${fastest.duration}ms)`);
        
        // 找到对应的URI
        const recommendedConfig = MONGODB_CONFIGS.find(c => c.name === fastest.config);
        console.log('\n📋 推荐的环境变量配置:');
        console.log(`MONGODB_URI=${recommendedConfig.uri}`);
        
    } else {
        console.log('\n⚠️  所有配置都连接失败');
        console.log('🔧 建议检查:');
        console.log('1. MongoDB Atlas集群状态');
        console.log('2. 网络连接');
        console.log('3. 用户名密码是否正确');
        console.log('4. IP白名单配置');
    }
    
    console.log('\n🏁 测试完成');
    process.exit(0);
}

// 处理未捕获的错误
process.on('unhandledRejection', (error) => {
    console.error('❌ 未处理的错误:', error);
    process.exit(1);
});

// 运行测试
main().catch(console.error);