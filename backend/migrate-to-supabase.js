const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');
const { supabase } = require('./src/config/supabase');

// MongoDB连接配置
const mongoUri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUri);

async function migrateData() {
    try {
        console.log('🚀 开始数据迁移...\n');
        
        // 连接MongoDB
        await mongoClient.connect();
        console.log('✅ MongoDB连接成功');
        
        const db = mongoClient.db('convenience_store');
        
        // 1. 迁移供应商数据
        console.log('\n📊 迁移供应商数据...');
        const suppliersCollection = db.collection('suppliers');
        const suppliers = await suppliersCollection.find({}).toArray();
        
        // 创建MongoDB ID到Supabase ID的映射
        const mongoToSupabaseSupplierMap = {};
        
        if (suppliers.length > 0) {
            // 转换数据格式（不包含id，让Supabase自动生成）
            const supabaseSuppliers = suppliers.map(supplier => ({
                name: supplier.name,
                contact: supplier.contact || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                created_at: supplier.createdAt || new Date().toISOString(),
                updated_at: supplier.createdAt || new Date().toISOString()
            }));
            
            const { data, error } = await supabase
                .from('suppliers')
                .insert(supabaseSuppliers)
                .select(); // 返回插入的数据以获取生成的ID
            
            if (error) {
                console.log('❌ 供应商数据迁移失败:', error);
                return;
            } else {
                console.log(`✅ 成功迁移 ${suppliers.length} 个供应商`);
                
                // 建立MongoDB ID到Supabase ID的映射
                suppliers.forEach((mongoSupplier, index) => {
                    if (data && data[index]) {
                        mongoToSupabaseSupplierMap[mongoSupplier._id.toString()] = data[index].id;
                        mongoToSupabaseSupplierMap[mongoSupplier.name] = data[index].id; // 也按名称映射
                    }
                });
            }
        } else {
            console.log('📝 没有找到供应商数据');
        }
        
        // 2. 迁移产品数据
        console.log('\n📦 迁移产品数据...');
        const productsCollection = db.collection('products');
        const products = await productsCollection.find({}).toArray();
        
        // 创建MongoDB产品ID到Supabase产品ID的映射
        const mongoToSupabaseProductMap = {};
        
        if (products.length > 0) {
            // 转换数据格式（不包含id，让Supabase自动生成）
            const supabaseProducts = products.map(product => ({
                name: product.name,
                price: parseFloat(product.price) || 0,
                stock: parseInt(product.stock) || 0,
                category: product.category || '',
                brand: product.brand || '', // 如果没有brand字段，设为空
                supplier_id: mongoToSupabaseSupplierMap[product.supplier] || null,
                status: 'active',
                created_at: product.createdAt || new Date().toISOString(),
                updated_at: product.updatedAt || product.createdAt || new Date().toISOString()
            }));
            
            const { data, error } = await supabase
                .from('products')
                .insert(supabaseProducts)
                .select(); // 返回插入的数据以获取生成的ID
            
            if (error) {
                console.log('❌ 产品数据迁移失败:', error);
                return;
            } else {
                console.log(`✅ 成功迁移 ${products.length} 个产品`);
                
                // 建立MongoDB产品ID到Supabase产品ID的映射
                products.forEach((mongoProduct, index) => {
                    if (data && data[index]) {
                        mongoToSupabaseProductMap[mongoProduct._id.toString()] = data[index].id;
                    }
                });
            }
        } else {
            console.log('📝 没有找到产品数据');
        }
        
        // 3. 迁移入库记录
        console.log('\n📥 迁移入库记录...');
        const inboundCollection = db.collection('inbounds');
        const inboundRecords = await inboundCollection.find({}).toArray();
        
        if (inboundRecords.length > 0) {
            // 转换数据格式
            const supabaseInbound = inboundRecords.map(record => ({
                product_id: mongoToSupabaseProductMap[record.productId?.toString()] || null,
                supplier_id: mongoToSupabaseSupplierMap[record.supplierId?.toString()] || null,
                quantity: parseInt(record.quantity) || 0,
                unit_price: parseFloat(record.unitPrice) || 0,
                total_amount: parseFloat(record.totalAmount) || 0,
                date: record.date || new Date().toISOString().split('T')[0],
                notes: record.notes || '',
                created_at: record.createdAt || new Date().toISOString()
            }));
            
            const { data, error } = await supabase
                .from('inbound_records')
                .insert(supabaseInbound);
            
            if (error) {
                console.log('❌ 入库记录迁移失败:', error);
            } else {
                console.log(`✅ 成功迁移 ${inboundRecords.length} 条入库记录`);
            }
        } else {
            console.log('📝 没有找到入库记录');
        }
        
        // 4. 迁移出库记录
        console.log('\n📤 迁移出库记录...');
        const outboundCollection = db.collection('outbounds');
        const outboundRecords = await outboundCollection.find({}).toArray();
        
        if (outboundRecords.length > 0) {
            // 转换数据格式
            const supabaseOutbound = outboundRecords.map(record => ({
                product_id: mongoToSupabaseProductMap[record.productId?.toString()] || null,
                quantity: parseInt(record.quantity) || 0,
                unit_price: parseFloat(record.unitPrice) || 0,
                total_amount: parseFloat(record.totalAmount) || 0,
                date: record.date || new Date().toISOString().split('T')[0],
                customer_name: record.customerName || '',
                notes: record.notes || '',
                created_at: record.createdAt || new Date().toISOString()
            }));
            
            const { data, error } = await supabase
                .from('outbound_records')
                .insert(supabaseOutbound);
            
            if (error) {
                console.log('❌ 出库记录迁移失败:', error);
            } else {
                console.log(`✅ 成功迁移 ${outboundRecords.length} 条出库记录`);
            }
        } else {
            console.log('📝 没有找到出库记录');
        }
        
        console.log('\n🎉 数据迁移完成！');
        
    } catch (error) {
        console.error('❌ 数据迁移失败:', error);
    } finally {
        await mongoClient.close();
        console.log('🔌 MongoDB连接已关闭');
    }
}

// 运行迁移
migrateData().catch(console.error);