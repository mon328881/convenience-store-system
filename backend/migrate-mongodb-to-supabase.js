#!/usr/bin/env node

/**
 * MongoDB到Supabase数据迁移脚本
 * 将MongoDB中的数据迁移到Supabase数据库
 */

const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 MongoDB到Supabase数据迁移');
console.log('=====================================\n');

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少Supabase环境变量');
    console.error('请确保设置了 SUPABASE_URL 和 SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MongoDB模型定义 - 使用实际的集合名称
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    brand: String,
    price: Number,
    stock: Number,
    lowStockThreshold: Number,
    supplier: String,
    barcode: String,
    description: String,
    status: String,
    createdAt: Date,
    updatedAt: Date
}, { collection: 'products' });

const supplierSchema = new mongoose.Schema({
    name: String,
    contact: String,
    phone: String,
    email: String,
    address: String,
    status: String,
    createdAt: Date,
    updatedAt: Date
}, { collection: 'suppliers' });

const inboundSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    supplierId: mongoose.Schema.Types.ObjectId,
    supplierName: String,
    quantity: Number,
    unitPrice: Number,
    totalAmount: Number,
    date: Date,
    notes: String,
    createdAt: Date,
    updatedAt: Date
}, { collection: 'inbounds' });

const outboundSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    quantity: Number,
    unitPrice: Number,
    totalAmount: Number,
    type: String,
    customerName: String,
    date: Date,
    notes: String,
    createdAt: Date,
    updatedAt: Date
}, { collection: 'outbounds' });

const Product = mongoose.model('Product', productSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);
const Inbound = mongoose.model('Inbound', inboundSchema);
const Outbound = mongoose.model('Outbound', outboundSchema);

// 数据迁移函数
async function migrateProducts() {
    console.log('📦 迁移产品数据...');
    
    try {
        const products = await Product.find({});
        console.log(`找到 ${products.length} 个产品`);
        
        if (products.length === 0) {
            console.log('⚠️ 没有找到产品数据');
            return;
        }
        
        const supabaseProducts = products.map(product => ({
            name: product.name,
            category: product.category || '未分类',
            brand: product.brand || '未知品牌',
            price: product.price || 0,
            stock: product.stock || 0,
            low_stock_threshold: product.lowStockThreshold || 10,
            supplier: product.supplier || '',
            barcode: product.barcode || '',
            description: product.description || '',
            status: product.status || 'active',
            created_at: product.createdAt || new Date(),
            updated_at: product.updatedAt || new Date()
        }));
        
        const { data, error } = await supabase
            .from('products')
            .insert(supabaseProducts);
            
        if (error) {
            console.error('❌ 产品数据迁移失败:', JSON.stringify(error, null, 2));
        } else {
            console.log(`✅ 成功迁移 ${products.length} 个产品`);
        }
    } catch (err) {
        console.error('❌ 产品迁移错误:', err.message);
    }
}

async function migrateSuppliers() {
    console.log('🏢 迁移供应商数据...');
    
    try {
        const suppliers = await Supplier.find({});
        console.log(`找到 ${suppliers.length} 个供应商`);
        
        if (suppliers.length === 0) {
            console.log('⚠️ 没有找到供应商数据');
            return;
        }
        
        const supabaseSuppliers = suppliers.map(supplier => ({
            name: supplier.name,
            contact: supplier.contact || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            status: supplier.status || 'active',
            created_at: supplier.createdAt || new Date(),
            updated_at: supplier.updatedAt || new Date()
        }));
        
        const { data, error } = await supabase
            .from('suppliers')
            .insert(supabaseSuppliers);
            
        if (error) {
            console.error('❌ 供应商数据迁移失败:', JSON.stringify(error, null, 2));
        } else {
            console.log(`✅ 成功迁移 ${suppliers.length} 个供应商`);
        }
    } catch (err) {
        console.error('❌ 供应商迁移错误:', err.message);
    }
}

async function migrateInbound() {
    console.log('📥 迁移入库记录...');
    
    try {
        const inbounds = await Inbound.find({});
        console.log(`找到 ${inbounds.length} 条入库记录`);
        
        if (inbounds.length === 0) {
            console.log('⚠️ 没有找到入库记录');
            return;
        }
        
        // 获取产品和供应商映射
        const { data: products } = await supabase.from('products').select('id, name');
        const { data: suppliers } = await supabase.from('suppliers').select('id, name');
        
        const productMap = new Map(products?.map(p => [p.name, p.id]) || []);
        const supplierMap = new Map(suppliers?.map(s => [s.name, s.id]) || []);
        
        const supabaseInbounds = inbounds.map(inbound => ({
            product_id: productMap.get(inbound.productName) || null,
            product_name: inbound.productName,
            supplier_id: supplierMap.get(inbound.supplierName) || null,
            supplier_name: inbound.supplierName,
            quantity: inbound.quantity || 0,
            unit_price: inbound.unitPrice || 0,
            total_amount: inbound.totalAmount || 0,
            date: inbound.date || new Date(),
            notes: inbound.notes || '',
            created_at: inbound.createdAt || new Date(),
            updated_at: inbound.updatedAt || new Date()
        }));
        
        const { data, error } = await supabase
            .from('inbound_records')
            .insert(supabaseInbounds);
            
        if (error) {
            console.error('❌ 入库记录迁移失败:', error);
        } else {
            console.log(`✅ 成功迁移 ${inbounds.length} 条入库记录`);
        }
    } catch (err) {
        console.error('❌ 入库记录迁移错误:', err.message);
    }
}

async function migrateOutbound() {
    console.log('📤 迁移出库记录...');
    
    try {
        const outbounds = await Outbound.find({});
        console.log(`找到 ${outbounds.length} 条出库记录`);
        
        if (outbounds.length === 0) {
            console.log('⚠️ 没有找到出库记录');
            return;
        }
        
        // 获取产品映射
        const { data: products } = await supabase.from('products').select('id, name');
        const productMap = new Map(products?.map(p => [p.name, p.id]) || []);
        
        const supabaseOutbounds = outbounds.map(outbound => ({
            product_id: productMap.get(outbound.productName) || null,
            product_name: outbound.productName,
            quantity: outbound.quantity || 0,
            unit_price: outbound.unitPrice || 0,
            total_amount: outbound.totalAmount || 0,
            type: outbound.type || 'sale',
            customer_name: outbound.customerName || '',
            date: outbound.date || new Date(),
            notes: outbound.notes || '',
            created_at: outbound.createdAt || new Date(),
            updated_at: outbound.updatedAt || new Date()
        }));
        
        const { data, error } = await supabase
            .from('outbound_records')
            .insert(supabaseOutbounds);
            
        if (error) {
            console.error('❌ 出库记录迁移失败:', error);
        } else {
            console.log(`✅ 成功迁移 ${outbounds.length} 条出库记录`);
        }
    } catch (err) {
        console.error('❌ 出库记录迁移错误:', err.message);
    }
}

async function main() {
    try {
        // 检查环境变量
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error('❌ 未找到MONGODB_URI环境变量');
            console.error('请确保.env文件中配置了MONGODB_URI');
            return;
        }
        
        // 连接MongoDB
        console.log('🔗 连接MongoDB...');
        console.log(`📍 连接地址: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`);
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ MongoDB连接成功');
        
        // 测试Supabase连接
        console.log('🔗 测试Supabase连接...');
        const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('❌ Supabase连接失败:', error);
            return;
        }
        console.log('✅ Supabase连接成功');
        
        // 清空Supabase表（可选）
        console.log('\n🗑️ 清空Supabase表...');
        await supabase.from('outbound_records').delete().neq('id', 0);
        await supabase.from('inbound_records').delete().neq('id', 0);
        await supabase.from('products').delete().neq('id', 0);
        await supabase.from('suppliers').delete().neq('id', 0);
        console.log('✅ 表已清空');
        
        // 开始迁移
        console.log('\n🚀 开始数据迁移...');
        await migrateProducts();
        await migrateSuppliers();
        await migrateInbound();
        await migrateOutbound();
        
        console.log('\n🎉 数据迁移完成！');
        
        // 验证迁移结果
        console.log('\n📊 迁移结果验证:');
        const { data: productCount } = await supabase.from('products').select('count', { count: 'exact', head: true });
        const { data: supplierCount } = await supabase.from('suppliers').select('count', { count: 'exact', head: true });
        const { data: inboundCount } = await supabase.from('inbound_records').select('count', { count: 'exact', head: true });
        const { data: outboundCount } = await supabase.from('outbound_records').select('count', { count: 'exact', head: true });
        
        console.log(`📦 产品: ${productCount?.count || 0} 条`);
        console.log(`🏢 供应商: ${supplierCount?.count || 0} 条`);
        console.log(`📥 入库记录: ${inboundCount?.count || 0} 条`);
        console.log(`📤 出库记录: ${outboundCount?.count || 0} 条`);
        
    } catch (error) {
        console.error('❌ 迁移失败:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 数据库连接已关闭');
    }
}

// 运行迁移
main().catch(console.error);