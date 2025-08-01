#!/usr/bin/env node

/**
 * MongoDB数据库初始化脚本
 * 检查并创建convenience_store数据库及其必需的集合和数据结构
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 MongoDB数据库初始化检查');
console.log('=====================================\n');

// 定义数据模型
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    supplier: { type: String },
    barcode: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['inbound', 'outbound'], required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number },
    supplier: { type: String },
    notes: { type: String },
    date: { type: Date, default: Date.now }
});

async function initializeDatabase() {
    try {
        // 连接到convenience_store数据库
        let mongoURI = process.env.MONGODB_URI;
        if (mongoURI.includes('/?')) {
            mongoURI = mongoURI.replace('/?', '/convenience_store?');
        } else if (mongoURI.includes('/')) {
            mongoURI = mongoURI.replace(/\/[^?]*/, '/convenience_store');
        } else {
            mongoURI = mongoURI + '/convenience_store';
        }
        console.log(`🔗 连接到数据库: ${mongoURI.replace(/\/\/[^@]*@/, '//***:***@')}`);
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ 数据库连接成功');
        console.log(`📁 当前数据库: ${mongoose.connection.name}`);
        
        // 检查现有集合
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📊 现有集合数量: ${collections.length}`);
        
        if (collections.length > 0) {
            console.log('📋 现有集合:');
            collections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
        } else {
            console.log('📋 数据库为空，需要初始化');
        }
        
        // 创建模型
        const Product = mongoose.model('Product', productSchema);
        const Supplier = mongoose.model('Supplier', supplierSchema);
        const Transaction = mongoose.model('Transaction', transactionSchema);
        
        // 检查并创建示例数据
        console.log('\n🏗️ 检查数据结构...');
        
        // 检查产品集合
        const productCount = await Product.countDocuments();
        console.log(`📦 产品数量: ${productCount}`);
        
        if (productCount === 0) {
            console.log('🔧 创建示例产品数据...');
            const sampleProducts = [
                {
                    name: '可口可乐',
                    category: '饮料',
                    price: 3.5,
                    stock: 100,
                    supplier: '可口可乐公司',
                    barcode: '1234567890123',
                    description: '经典可乐饮料'
                },
                {
                    name: '薯片',
                    category: '零食',
                    price: 8.0,
                    stock: 50,
                    supplier: '乐事公司',
                    barcode: '2345678901234',
                    description: '原味薯片'
                },
                {
                    name: '矿泉水',
                    category: '饮料',
                    price: 2.0,
                    stock: 200,
                    supplier: '农夫山泉',
                    barcode: '3456789012345',
                    description: '天然矿泉水'
                }
            ];
            
            await Product.insertMany(sampleProducts);
            console.log('✅ 示例产品数据创建完成');
        }
        
        // 检查供应商集合
        const supplierCount = await Supplier.countDocuments();
        console.log(`🏢 供应商数量: ${supplierCount}`);
        
        if (supplierCount === 0) {
            console.log('🔧 创建示例供应商数据...');
            const sampleSuppliers = [
                {
                    name: '可口可乐公司',
                    contact: '张经理',
                    phone: '138-0000-1111',
                    email: 'zhang@coca-cola.com',
                    address: '上海市浦东新区'
                },
                {
                    name: '乐事公司',
                    contact: '李经理',
                    phone: '138-0000-2222',
                    email: 'li@lays.com',
                    address: '北京市朝阳区'
                },
                {
                    name: '农夫山泉',
                    contact: '王经理',
                    phone: '138-0000-3333',
                    email: 'wang@nongfu.com',
                    address: '杭州市西湖区'
                }
            ];
            
            await Supplier.insertMany(sampleSuppliers);
            console.log('✅ 示例供应商数据创建完成');
        }
        
        // 检查交易记录集合
        const transactionCount = await Transaction.countDocuments();
        console.log(`📈 交易记录数量: ${transactionCount}`);
        
        // 最终状态检查
        console.log('\n📊 数据库初始化完成状态:');
        console.log(`📦 产品总数: ${await Product.countDocuments()}`);
        console.log(`🏢 供应商总数: ${await Supplier.countDocuments()}`);
        console.log(`📈 交易记录总数: ${await Transaction.countDocuments()}`);
        
        // 验证API所需的基本操作
        console.log('\n🧪 验证API操作...');
        
        // 测试产品查询
        const products = await Product.find().limit(3);
        console.log(`✅ 产品查询成功，返回 ${products.length} 条记录`);
        
        // 测试供应商查询
        const suppliers = await Supplier.find().limit(3);
        console.log(`✅ 供应商查询成功，返回 ${suppliers.length} 条记录`);
        
        console.log('\n🎉 数据库初始化验证完成！');
        console.log('现在腾讯云函数应该能够正常连接和操作数据库了。');
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        
        if (error.message.includes('authentication failed')) {
            console.log('💡 建议: 检查MongoDB用户名和密码');
        } else if (error.message.includes('timeout')) {
            console.log('💡 建议: 检查网络连接和MongoDB Atlas白名单设置');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('💡 建议: 检查MongoDB集群地址是否正确');
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌 数据库连接已关闭');
    }
}

// 运行初始化
initializeDatabase().catch(console.error);