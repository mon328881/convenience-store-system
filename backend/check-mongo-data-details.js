const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');

// MongoDB连接配置
const mongoUri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUri);

async function checkMongoData() {
    try {
        console.log('🔍 检查MongoDB数据详情...\n');
        
        // 连接MongoDB
        await mongoClient.connect();
        console.log('✅ MongoDB连接成功');
        
        const db = mongoClient.db('convenience_store');
        
        // 检查suppliers数据
        console.log('\n📊 Suppliers数据:');
        const suppliers = await db.collection('suppliers').find({}).toArray();
        console.log(`总数: ${suppliers.length}`);
        if (suppliers.length > 0) {
            console.log('示例数据:');
            suppliers.forEach((supplier, index) => {
                console.log(`${index + 1}. ${JSON.stringify(supplier, null, 2)}`);
            });
        }
        
        // 检查products数据
        console.log('\n📦 Products数据:');
        const products = await db.collection('products').find({}).toArray();
        console.log(`总数: ${products.length}`);
        if (products.length > 0) {
            console.log('示例数据:');
            products.forEach((product, index) => {
                console.log(`${index + 1}. ${JSON.stringify(product, null, 2)}`);
            });
        }
        
        // 检查inbounds数据
        console.log('\n📥 Inbounds数据:');
        const inbounds = await db.collection('inbounds').find({}).toArray();
        console.log(`总数: ${inbounds.length}`);
        if (inbounds.length > 0) {
            console.log('示例数据:');
            inbounds.forEach((inbound, index) => {
                console.log(`${index + 1}. ${JSON.stringify(inbound, null, 2)}`);
            });
        }
        
        // 检查outbounds数据
        console.log('\n📤 Outbounds数据:');
        const outbounds = await db.collection('outbounds').find({}).toArray();
        console.log(`总数: ${outbounds.length}`);
        if (outbounds.length > 0) {
            console.log('示例数据:');
            outbounds.forEach((outbound, index) => {
                console.log(`${index + 1}. ${JSON.stringify(outbound, null, 2)}`);
            });
        }
        
    } catch (error) {
        console.error('❌ 检查MongoDB数据失败:', error);
    } finally {
        await mongoClient.close();
        console.log('\n🔌 MongoDB连接已关闭');
    }
}

checkMongoData().catch(console.error);