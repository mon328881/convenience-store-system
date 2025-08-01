require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkMongoData() {
    console.log('🔍 检查MongoDB数据结构...');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('❌ 未找到MONGODB_URI环境变量');
        return;
    }
    
    const client = new MongoClient(mongoUri);
    
    try {
        await client.connect();
        console.log('✅ MongoDB连接成功');
        
        const db = client.db('convenience-store');
        
        // 检查products集合
        console.log('\n📦 Products集合数据结构:');
        const products = await db.collection('products').find({}).limit(1).toArray();
        if (products.length > 0) {
            console.log('字段:', Object.keys(products[0]));
            console.log('示例数据:', JSON.stringify(products[0], null, 2));
        } else {
            console.log('没有找到产品数据');
        }
        
        // 检查suppliers集合
        console.log('\n🏢 Suppliers集合数据结构:');
        const suppliers = await db.collection('suppliers').find({}).limit(1).toArray();
        if (suppliers.length > 0) {
            console.log('字段:', Object.keys(suppliers[0]));
            console.log('示例数据:', JSON.stringify(suppliers[0], null, 2));
        } else {
            console.log('没有找到供应商数据');
        }
        
        // 检查inbound集合
        console.log('\n📥 Inbound集合数据结构:');
        const inbound = await db.collection('inbound').find({}).limit(1).toArray();
        if (inbound.length > 0) {
            console.log('字段:', Object.keys(inbound[0]));
            console.log('示例数据:', JSON.stringify(inbound[0], null, 2));
        } else {
            console.log('没有找到入库数据');
        }
        
        // 检查outbound集合
        console.log('\n📤 Outbound集合数据结构:');
        const outbound = await db.collection('outbound').find({}).limit(1).toArray();
        if (outbound.length > 0) {
            console.log('字段:', Object.keys(outbound[0]));
            console.log('示例数据:', JSON.stringify(outbound[0], null, 2));
        } else {
            console.log('没有找到出库数据');
        }
        
    } catch (error) {
        console.error('❌ 检查数据时出错:', error);
    } finally {
        await client.close();
        console.log('🔌 MongoDB连接已关闭');
    }
}

checkMongoData();