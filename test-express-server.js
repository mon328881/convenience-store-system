const express = require('express');
const mongoose = require('mongoose');

// 创建Express应用
const app = express();
app.use(express.json());

// MongoDB连接URI（使用测试成功的配置）
const MONGODB_URI = 'mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/?serverSelectionTimeoutMS=10000&connectTimeoutMS=15000';

// 连接MongoDB
async function connectMongoDB() {
    try {
        console.log('🔗 正在连接MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB连接成功');
        return true;
    } catch (error) {
        console.error('❌ MongoDB连接失败:', error.message);
        return false;
    }
}

// CORS中间件
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

// 健康检查路由
app.get('/health', async (req, res) => {
    const isConnected = await connectMongoDB();
    
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: isConnected ? 'connected' : 'disconnected',
        message: isConnected ? 'MongoDB连接正常' : 'MongoDB连接失败'
    });
});

// API健康检查
app.get('/api/health', async (req, res) => {
    try {
        const isConnected = await connectMongoDB();
        
        if (!isConnected) {
            return res.status(500).json({
                success: false,
                error: '数据库连接失败',
                timestamp: new Date().toISOString()
            });
        }
        
        // 测试数据库操作
        const dbStatus = await mongoose.connection.db.admin().ping();
        
        res.json({
            success: true,
            message: '数据库连接正常',
            dbStatus,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 测试数据库操作
app.get('/api/test-db', async (req, res) => {
    try {
        const isConnected = await connectMongoDB();
        
        if (!isConnected) {
            return res.status(500).json({
                success: false,
                error: '数据库连接失败'
            });
        }
        
        // 获取数据库信息
        const dbName = mongoose.connection.db.databaseName;
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        res.json({
            success: true,
            database: dbName,
            collections: collections.map(c => c.name),
            connectionState: mongoose.connection.readyState,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 启动服务器
const port = 3001;

app.listen(port, () => {
    console.log('🚀 本地测试服务器启动成功');
    console.log(`📍 服务地址: http://localhost:${port}`);
    console.log('🔍 测试端点:');
    console.log(`   - http://localhost:${port}/health`);
    console.log(`   - http://localhost:${port}/api/health`);
    console.log(`   - http://localhost:${port}/api/test-db`);
    console.log('\n🧪 测试命令:');
    console.log(`curl http://localhost:${port}/health`);
    console.log(`curl http://localhost:${port}/api/health`);
    console.log(`curl http://localhost:${port}/api/test-db`);
});

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n🛑 正在关闭服务器...');
    
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('✅ MongoDB连接已关闭');
    }
    
    process.exit(0);
});