#!/usr/bin/env node

/**
 * 腾讯云函数MongoDB连接诊断工具
 * 专门用于诊断腾讯云函数的MongoDB连接问题
 */

const mongoose = require('mongoose');

console.log('🔍 腾讯云函数MongoDB连接诊断');
console.log('=====================================\n');

// 从.env文件读取本地配置进行对比
require('dotenv').config();

const localMongoURI = process.env.MONGODB_URI;
console.log('📋 本地配置分析:');
console.log(`本地MONGODB_URI: ${localMongoURI}`);

// 分析URI结构
if (localMongoURI) {
    try {
        const url = new URL(localMongoURI);
        console.log(`✅ 协议: ${url.protocol}`);
        console.log(`✅ 主机: ${url.hostname}`);
        console.log(`✅ 数据库路径: ${url.pathname}`);
        console.log(`✅ 查询参数: ${url.search}`);
        
        // 检查数据库名称
        const dbName = url.pathname.split('/')[1];
        if (dbName && dbName !== '') {
            console.log(`✅ 数据库名称: ${dbName}`);
        } else {
            console.log(`❌ 缺少数据库名称！`);
        }
    } catch (error) {
        console.log(`❌ URI格式错误: ${error.message}`);
    }
}

console.log('\n🔧 推荐的腾讯云函数环境变量配置:');
console.log('=====================================');

// 生成修正的URI（确保包含数据库名称）
let correctedURI = localMongoURI;
if (localMongoURI && !localMongoURI.includes('/convenience_store')) {
    // 在域名后添加数据库名称
    correctedURI = localMongoURI.replace(
        /\.mongodb\.net\/[^?]*/,
        '.mongodb.net/convenience_store'
    );
}

console.log('在腾讯云函数控制台中配置以下环境变量：\n');

console.log('键: MONGODB_URI');
console.log(`值: ${correctedURI}`);
console.log('');

console.log('键: JWT_SECRET');
console.log(`值: ${process.env.JWT_SECRET || 'MyConvenienceStore2024SecretKey!@#$%RandomString123456789'}`);
console.log('');

console.log('键: NODE_ENV');
console.log('值: production');
console.log('');

// 测试连接
async function testConnection() {
    console.log('🧪 测试连接配置:');
    console.log('=====================================');
    
    const testConfigs = [
        {
            name: '当前本地配置',
            uri: localMongoURI,
            options: {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            }
        },
        {
            name: '修正后配置（推荐用于腾讯云函数）',
            uri: correctedURI,
            options: {
                serverSelectionTimeoutMS: 20000,
                socketTimeoutMS: 120000,
                maxPoolSize: 2,
                retryWrites: true,
                retryReads: true,
            }
        }
    ];
    
    for (const config of testConfigs) {
        console.log(`\n📋 测试: ${config.name}`);
        console.log(`URI: ${config.uri}`);
        
        try {
            const startTime = Date.now();
            await mongoose.connect(config.uri, config.options);
            const connectTime = Date.now() - startTime;
            
            console.log(`✅ 连接成功 (${connectTime}ms)`);
            console.log(`📁 数据库名: ${mongoose.connection.name || '未指定'}`);
            
            // 测试基本操作
            try {
                const collections = await mongoose.connection.db.listCollections().toArray();
                console.log(`📊 集合数量: ${collections.length}`);
                if (collections.length > 0) {
                    console.log(`📋 集合列表: ${collections.map(c => c.name).join(', ')}`);
                }
            } catch (opError) {
                console.log(`❌ 数据库操作失败: ${opError.message}`);
            }
            
            await mongoose.disconnect();
            console.log('🔌 连接已关闭');
            
        } catch (error) {
            console.log(`❌ 连接失败: ${error.message}`);
            
            // 分析错误类型
            if (error.message.includes('authentication failed')) {
                console.log('💡 建议: 检查用户名和密码是否正确');
            } else if (error.message.includes('timeout')) {
                console.log('💡 建议: 网络超时，可能需要增加超时时间或检查网络');
            } else if (error.message.includes('ENOTFOUND')) {
                console.log('💡 建议: DNS解析失败，检查集群地址是否正确');
            }
        }
    }
}

// 生成腾讯云函数配置指令
console.log('\n🚀 腾讯云函数配置步骤:');
console.log('=====================================');
console.log('1. 登录腾讯云控制台: https://console.cloud.tencent.com/scf');
console.log('2. 找到你的函数（可能叫 inventory-scf）');
console.log('3. 点击"函数配置" -> "环境变量"');
console.log('4. 添加上述三个环境变量');
console.log('5. 保存配置并等待部署完成');
console.log('6. 重新运行测试: ./quick-verify.sh');

// 运行测试
testConnection().catch(console.error);