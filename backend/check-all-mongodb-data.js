require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkAllMongoDBData() {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        console.error('❌ 未找到MONGODB_URI环境变量');
        return;
    }

    console.log('🔍 检查MongoDB所有数据库和集合...');
    
    let client;
    try {
        client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ MongoDB连接成功');

        // 获取所有数据库
        const adminDb = client.db().admin();
        const databases = await adminDb.listDatabases();
        
        console.log('\n📚 所有数据库:');
        for (const db of databases.databases) {
            console.log(`  - ${db.name} (大小: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
            
            // 检查每个数据库的集合
            const database = client.db(db.name);
            const collections = await database.listCollections().toArray();
            
            if (collections.length > 0) {
                console.log(`    集合:`);
                for (const collection of collections) {
                    const coll = database.collection(collection.name);
                    const count = await coll.countDocuments();
                    console.log(`      - ${collection.name}: ${count} 条记录`);
                    
                    // 如果有数据，显示一个示例
                    if (count > 0) {
                        const sample = await coll.findOne();
                        console.log(`        示例数据字段: ${Object.keys(sample).join(', ')}`);
                    }
                }
            } else {
                console.log(`    (无集合)`);
            }
        }

        // 特别检查convenience_store数据库
        console.log('\n🎯 特别检查convenience_store数据库:');
        const convenienceDb = client.db('convenience_store');
        const convenienceCollections = await convenienceDb.listCollections().toArray();
        
        if (convenienceCollections.length > 0) {
            for (const collection of convenienceCollections) {
                const coll = convenienceDb.collection(collection.name);
                const count = await coll.countDocuments();
                console.log(`  - ${collection.name}: ${count} 条记录`);
                
                if (count > 0) {
                    const sample = await coll.findOne();
                    console.log(`    字段: ${Object.keys(sample).join(', ')}`);
                }
            }
        } else {
            console.log('  convenience_store数据库为空');
        }

    } catch (error) {
        console.error('❌ MongoDB连接错误:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 MongoDB连接已关闭');
        }
    }
}

checkAllMongoDBData();