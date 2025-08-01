const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addProductFields() {
    console.log('开始添加商品表字段...');
    
    const sqlCommands = [
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 0;',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2) DEFAULT 0;',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10,2) DEFAULT 0;',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS input_price DECIMAL(10,2) DEFAULT 0;',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_alert INTEGER DEFAULT 10;',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS total_inbound INTEGER DEFAULT 0;',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS total_outbound INTEGER DEFAULT 0;',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) DEFAULT \'system\';',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100) DEFAULT \'system\';'
    ];
    
    for (const sql of sqlCommands) {
        try {
            console.log(`执行SQL: ${sql}`);
            const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
            
            if (error) {
                console.error(`执行失败: ${error.message}`);
                // 尝试直接使用SQL查询
                const { data: directData, error: directError } = await supabase
                    .from('information_schema.columns')
                    .select('*')
                    .eq('table_name', 'products')
                    .limit(1);
                    
                if (directError) {
                    console.error('直接查询也失败:', directError.message);
                } else {
                    console.log('数据库连接正常，但无法执行DDL语句');
                }
            } else {
                console.log('✅ 执行成功');
            }
        } catch (err) {
            console.error(`执行异常: ${err.message}`);
        }
    }
    
    // 检查表结构
    try {
        console.log('\n检查products表结构...');
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('查询表结构失败:', error.message);
        } else {
            console.log('✅ products表可以正常访问');
            if (data && data.length > 0) {
                console.log('表字段:', Object.keys(data[0]));
            }
        }
    } catch (err) {
        console.error('检查表结构异常:', err.message);
    }
}

addProductFields().then(() => {
    console.log('脚本执行完成');
    process.exit(0);
}).catch(err => {
    console.error('脚本执行失败:', err);
    process.exit(1);
});