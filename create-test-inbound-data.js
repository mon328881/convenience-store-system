#!/usr/bin/env node

/**
 * 创建入库记录测试数据脚本
 * 建立商品和供应商的关联关系
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 导入模型
const Product = require('./backend/src/models/Product');
const Supplier = require('./backend/src/models/Supplier');
const Inbound = require('./backend/src/models/Inbound');

async function createTestInboundData() {
    try {
        // 连接数据库 - 使用本地MongoDB
        const mongoURI = 'mongodb://localhost:27017/convenience_store';
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ 数据库连接成功');
        
        // 获取现有的商品和供应商
        const products = await Product.find();
        const suppliers = await Supplier.find();
        
        console.log(`📦 找到 ${products.length} 个商品`);
        console.log(`🏢 找到 ${suppliers.length} 个供应商`);
        
        if (products.length === 0 || suppliers.length === 0) {
            console.log('❌ 需要先有商品和供应商数据');
            return;
        }
        
        // 检查是否已有入库记录
        const existingInbounds = await Inbound.countDocuments();
        console.log(`📈 现有入库记录: ${existingInbounds} 条`);
        
        if (existingInbounds > 0) {
            console.log('ℹ️ 已有入库记录，跳过创建');
            return;
        }
        
        // 创建测试入库记录
        const testInbounds = [];
        
        // 为每个商品创建与不同供应商的入库记录
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            
            // 每个商品关联1-2个供应商
            const supplierCount = Math.min(suppliers.length, 2);
            for (let j = 0; j < supplierCount; j++) {
                const supplier = suppliers[(i + j) % suppliers.length];
                
                testInbounds.push({
                    inboundNumber: `IN${Date.now()}${i}${j}`,
                    product: product._id,
                    supplier: supplier._id,
                    quantity: Math.floor(Math.random() * 50) + 10, // 10-59
                    purchasePrice: product.price * (0.6 + Math.random() * 0.2), // 60%-80% of selling price
                    totalAmount: 0, // 会在保存时计算
                    inboundDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 过去30天内
                    remark: `${product.name} 从 ${supplier.name} 进货`,
                    status: 'completed',
                    createdBy: 'system'
                });
            }
        }
        
        // 计算总金额
        testInbounds.forEach(inbound => {
            inbound.totalAmount = inbound.quantity * inbound.purchasePrice;
        });
        
        // 批量插入入库记录
        await Inbound.insertMany(testInbounds);
        
        console.log(`✅ 成功创建 ${testInbounds.length} 条入库记录`);
        
        // 验证数据
        const inboundCount = await Inbound.countDocuments();
        console.log(`📈 总入库记录数: ${inboundCount}`);
        
        // 显示每个商品关联的供应商
        console.log('\n📊 商品-供应商关联关系:');
        for (const product of products) {
            const relatedInbounds = await Inbound.find({ product: product._id })
                .populate('supplier', 'name');
            
            const supplierNames = relatedInbounds.map(inbound => inbound.supplier.name);
            console.log(`📦 ${product.name}: ${supplierNames.join(', ')}`);
        }
        
        console.log('\n🎉 测试数据创建完成！现在可以测试商品-供应商联动功能了。');
        
    } catch (error) {
        console.error('❌ 创建测试数据失败:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 数据库连接已关闭');
    }
}

// 运行脚本
createTestInboundData();