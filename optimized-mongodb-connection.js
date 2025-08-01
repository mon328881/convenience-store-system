#!/usr/bin/env node

/**
 * 🚀 优化的 MongoDB 连接配置
 * 专为腾讯云函数环境设计，解决连接超时和稳定性问题
 */

const mongoose = require('mongoose');

// 🔧 优化的连接配置
class OptimizedMongoConnection {
    constructor() {
        this.isConnected = false;
        this.connectionPromise = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    /**
     * 获取优化的连接选项
     */
    getConnectionOptions() {
        return {
            // 基础配置
            useNewUrlParser: true,
            useUnifiedTopology: true,
            
            // 🚀 连接池优化（云函数环境）
            maxPoolSize: 3,          // 减少连接池大小，适合云函数
            minPoolSize: 1,          // 保持最小连接数
            maxIdleTimeMS: 30000,    // 30秒后关闭空闲连接
            
            // ⏱️ 超时优化
            serverSelectionTimeoutMS: 8000,   // 服务器选择超时（8秒）
            connectTimeoutMS: 10000,           // 连接超时（10秒）
            socketTimeoutMS: 30000,            // Socket超时（30秒）
            heartbeatFrequencyMS: 10000,       // 心跳频率（10秒）
            
            // 🔄 重试和缓冲优化
            retryWrites: true,                 // 启用写重试
            retryReads: true,                  // 启用读重试
            bufferCommands: false,             // 禁用命令缓冲（云函数环境）
            bufferMaxEntries: 0,               // 禁用缓冲队列
            
            // 🛡️ 稳定性优化
            autoIndex: false,                  // 禁用自动索引创建
            autoCreate: false,                 // 禁用自动集合创建
            
            // 📊 监控和日志
            loggerLevel: 'error',              // 只记录错误日志
            
            // 🌐 网络优化
            family: 4,                         // 强制使用 IPv4
            keepAlive: true,                   // 启用 TCP keep-alive
            keepAliveInitialDelay: 300000,     // keep-alive 初始延迟（5分钟）
        };
    }

    /**
     * 智能连接方法（带重试机制）
     */
    async connect(uri) {
        // 如果已经连接，直接返回
        if (this.isConnected && mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        // 如果正在连接，等待连接完成
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // 开始新的连接
        this.connectionPromise = this._connectWithRetry(uri);
        return this.connectionPromise;
    }

    /**
     * 带重试的连接方法
     */
    async _connectWithRetry(uri) {
        const options = this.getConnectionOptions();
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🔗 MongoDB 连接尝试 ${attempt}/${this.maxRetries}...`);
                
                // 如果不是第一次尝试，先断开现有连接
                if (attempt > 1) {
                    await this._safeDisconnect();
                    // 指数退避延迟
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    console.log(`⏳ 等待 ${delay}ms 后重试...`);
                    await this._sleep(delay);
                }

                // 尝试连接
                await mongoose.connect(uri, options);
                
                // 连接成功
                this.isConnected = true;
                this.retryCount = 0;
                console.log('✅ MongoDB 连接成功！');
                console.log(`📊 连接状态: ${mongoose.connection.readyState}`);
                console.log(`🏷️  数据库: ${mongoose.connection.name}`);
                
                // 设置连接事件监听
                this._setupConnectionListeners();
                
                return mongoose.connection;
                
            } catch (error) {
                console.error(`❌ 连接尝试 ${attempt} 失败:`, error.message);
                
                if (attempt === this.maxRetries) {
                    this.connectionPromise = null;
                    throw new Error(`MongoDB 连接失败，已重试 ${this.maxRetries} 次: ${error.message}`);
                }
            }
        }
    }

    /**
     * 设置连接事件监听
     */
    _setupConnectionListeners() {
        const connection = mongoose.connection;

        // 连接断开事件
        connection.on('disconnected', () => {
            console.log('⚠️ MongoDB 连接已断开');
            this.isConnected = false;
        });

        // 连接错误事件
        connection.on('error', (error) => {
            console.error('❌ MongoDB 连接错误:', error.message);
            this.isConnected = false;
        });

        // 重新连接事件
        connection.on('reconnected', () => {
            console.log('🔄 MongoDB 重新连接成功');
            this.isConnected = true;
        });
    }

    /**
     * 安全断开连接
     */
    async _safeDisconnect() {
        try {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }
        } catch (error) {
            console.warn('断开连接时出现警告:', error.message);
        }
        this.isConnected = false;
    }

    /**
     * 睡眠函数
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取连接状态
     */
    getStatus() {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            status: states[mongoose.connection.readyState] || 'unknown',
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port
        };
    }

    /**
     * 健康检查
     */
    async healthCheck() {
        try {
            if (!this.isConnected || mongoose.connection.readyState !== 1) {
                return { healthy: false, error: '数据库未连接' };
            }

            // 执行简单的数据库操作测试
            const admin = mongoose.connection.db.admin();
            await admin.ping();
            
            return { 
                healthy: true, 
                status: this.getStatus(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { 
                healthy: false, 
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// 创建单例实例
const mongoConnection = new OptimizedMongoConnection();

// 导出连接函数和实例
module.exports = {
    connectDB: (uri) => mongoConnection.connect(uri),
    getConnectionStatus: () => mongoConnection.getStatus(),
    healthCheck: () => mongoConnection.healthCheck(),
    mongoConnection
};

// 如果直接运行此文件，进行测试
if (require.main === module) {
    async function test() {
        console.log('🧪 测试优化的 MongoDB 连接...');
        
        const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority';
        
        try {
            await mongoConnection.connect(uri);
            console.log('✅ 连接测试成功！');
            
            const health = await mongoConnection.healthCheck();
            console.log('🏥 健康检查:', health);
            
            const status = mongoConnection.getStatus();
            console.log('📊 连接状态:', status);
            
        } catch (error) {
            console.error('❌ 测试失败:', error.message);
        } finally {
            process.exit(0);
        }
    }
    
    test();
}