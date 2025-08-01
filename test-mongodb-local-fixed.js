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
    let connection = null;
    
    try {
        // 使用mongoose.connect进行连接测试
        connection = mongoose.createConnection();
        
        // 设置连接选项
        const options = {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 15000,
        };
        
        await connection.openUri(config.uri, options);
        
        const duration = Date.now() - startTime;
        console.log(`✅ 连接成功! 耗时: ${duration}ms`);
        
        // 获取数据库信息
        const dbName = connection.db.databaseName || 'test';
        console.log(`📊 数据库名称: ${dbName}`);
        
        // 测试ping
        const pingResult = await connection.db.admin().ping();
        console.log(`🏓 Ping结果: ${JSON.stringify(pingResult)}`);
        
        // 列出集合
        try {
            const collections = await connection.db.listCollections().toArray();
            console.log(`📁 集合数量: ${collections.length}`);
            if (collections.length > 0) {
                console.log(`📋 集合列表: ${collections.map(c => c.name).join(', ')}`);
            }
        } catch (listError) {
            console.log(`📁 无法列出集合: ${listError.message}`);
        }
        
        return { success: true, duration, dbName, error: null };
        
    } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`❌ 连接失败! 耗时: ${duration}ms`);
        console.log(`🔍 错误类型: ${error.name}`);
        console.log(`📝 错误信息: ${error.message}`);
        
        if (error.reason) {
            console.log(`🎯 详细原因: ${error.reason.type || 'Unknown'}`);
            if (error.reason.servers) {
                console.log(`🖥️  服务器状态:`);
                error.reason.servers.forEach((server, host) => {
                    console.log(`   - ${host}: ${server.type || 'Unknown'} (${server.error || 'No error'})`);
                });
            }
        }
        
        return { success: false, duration, error: error.message };
        
    } finally {
        // 确保连接被关闭
        if (connection && connection.readyState !== 0) {
            try {
                await connection.close();
            } catch (closeError) {
                console.log(`⚠️  关闭连接时出错: ${closeError.message}`);
            }
        }
    }
}

async function main() {
    console.log('🔍 MongoDB Atlas 本地连接测试');
    console.log('================================');
    console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
    console.log(`🖥️  Node.js版本: ${process.version}`);
    console.log(`📦 Mongoose版本: ${mongoose.version}`);
    
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
        if (!result.success && result.error) {
            console.log(`   错误: ${result.error}`);
        }
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
        
        console.log('\n🔧 腾讯云函数配置步骤:');
        console.log('1. 登录腾讯云控制台');
        console.log('2. 进入云函数 -> inventory-api');
        console.log('3. 函数配置 -> 环境变量');
        console.log('4. 修改MONGODB_URI为上述推荐值');
        console.log('5. 保存配置并等待生效');
        
    } else {
        console.log('\n⚠️  所有配置都连接失败');
        console.log('🔧 建议检查:');
        console.log('1. MongoDB Atlas集群状态 (https://cloud.mongodb.com/)');
        console.log('2. 网络连接是否正常');
        console.log('3. 用户名密码是否正确');
        console.log('4. IP白名单是否包含当前IP');
        console.log('5. 集群是否正在维护');
        
        console.log('\n🌐 当前网络信息:');
        console.log('可以访问 https://whatismyipaddress.com/ 查看当前IP地址');
    }
    
    console.log('\n🏁 测试完成');
}

// 处理未捕获的错误
process.on('unhandledRejection', (error) => {
    console.error('❌ 未处理的错误:', error.message);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error.message);
    process.exit(1);
});

// 运行测试
main().catch((error) => {
    console.error('❌ 主程序错误:', error.message);
    process.exit(1);
});