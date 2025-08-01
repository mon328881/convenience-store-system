const { Hono } = require('hono');
const mongoose = require('mongoose');

// 创建Hono应用
const app = new Hono();

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

// 健康检查路由
app.get('/health', async (c) => {
    const isConnected = await connectMongoDB();
    
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: isConnected ? 'connected' : 'disconnected',
        message: isConnected ? 'MongoDB连接正常' : 'MongoDB连接失败'
    });
});

// API健康检查
app.get('/api/health', async (c) => {
    try {
        const isConnected = await connectMongoDB();
        
        if (!isConnected) {
            return c.json({
                success: false,
                error: '数据库连接失败',
                timestamp: new Date().toISOString()
            }, 500);
        }
        
        // 测试数据库操作
        const dbStatus = await mongoose.connection.db.admin().ping();
        
        return c.json({
            success: true,
            message: '数据库连接正常',
            dbStatus,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        return c.json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, 500);
    }
});

// 启动本地服务器
const port = 3001;

console.log('🚀 启动本地测试服务器...');
console.log(`📍 服务地址: http://localhost:${port}`);
console.log('🔍 测试端点:');
console.log(`   - http://localhost:${port}/health`);
console.log(`   - http://localhost:${port}/api/health`);

// 使用Node.js内置的http模块启动服务器
const http = require('http');

const server = http.createServer(async (req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    try {
        // 创建Hono请求对象
        const url = new URL(req.url, `http://localhost:${port}`);
        const request = new Request(url.toString(), {
            method: req.method,
            headers: req.headers,
        });
        
        // 处理请求
        const response = await app.fetch(request);
        const responseText = await response.text();
        
        // 设置响应头
        res.writeHead(response.status, {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers.entries())
        });
        
        res.end(responseText);
        
    } catch (error) {
        console.error('❌ 请求处理错误:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }));
    }
});

server.listen(port, () => {
    console.log(`✅ 服务器启动成功，监听端口 ${port}`);
    console.log('\n🧪 现在可以测试以下端点:');
    console.log(`curl http://localhost:${port}/health`);
    console.log(`curl http://localhost:${port}/api/health`);
});

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n🛑 正在关闭服务器...');
    
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('✅ MongoDB连接已关闭');
    }
    
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});