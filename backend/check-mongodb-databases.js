const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');

// MongoDB连接配置
const mongoUri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUri);

async function checkMongoDatabases() {
    try {
        console.log('🔍 检查MongoDB数据库和集合...\n');
        
        // 连接MongoDB
        await mongoClient.connect();
        console.log('✅ MongoDB连接成功');
        
        // 列出所有数据库
        const adminDb = mongoClient.db().admin();
        const databases = await adminDb.listDatabases();
        
        console.log('\n📊 可用的数据库:');
        for (const db of databases.databases) {
            console.log(`- ${db.name} (大小: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        }
        
        // 检查每个数据库中的集合
        for (const dbInfo of databases.databases) {
            if (dbInfo.name === 'admin' || dbInfo.name === 'local' || dbInfo.name === 'config') {
                continue; // 跳过系统数据库
            }
            
            console.log(`\n🗂️  数据库 "${dbInfo.name}" 中的集合:`);
            const db = mongoClient.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            
            if (collections.length === 0) {
                console.log('  (无集合)');
                continue;
            }
            
            for (const collection of collections) {
                const collectionName = collection.name;
                const count = await db.collection(collectionName).countDocuments();
                console.log(`  - ${collectionName}: ${count} 条记录`);
                
                // 如果有数据，显示一个示例文档
                if (count > 0) {
                    const sample = await db.collection(collectionName).findOne();
                    console.log(`    示例文档字段: ${Object.keys(sample).join(', ')}`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ 检查MongoDB失败:', error);
    } finally {
        await mongoClient.close();
        console.log('\n🔌 MongoDB连接已关闭');
    }
}

checkMongoDatabases().catch(console.error);