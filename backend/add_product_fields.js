const { supabase } = require('./src/config/supabase');

async function addProductFields() {
    console.log('开始添加商品表字段...');
    
    // 首先检查当前表结构
    try {
        console.log('检查products表当前结构...');
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('查询表结构失败:', error.message);
            return;
        }
        
        console.log('✅ products表可以正常访问');
        if (data && data.length > 0) {
            console.log('当前表字段:', Object.keys(data[0]));
        } else {
            console.log('表为空，无法获取字段信息');
        }
    } catch (err) {
        console.error('检查表结构异常:', err.message);
        return;
    }
    
    // 尝试通过Supabase管理界面的SQL编辑器执行的方式
    console.log('\n由于PostgREST限制，无法直接执行DDL语句');
    console.log('请手动在Supabase管理界面的SQL编辑器中执行以下SQL语句：');
    console.log('\n--- 复制以下SQL到Supabase SQL编辑器 ---');
    
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
    
    sqlCommands.forEach(sql => {
        console.log(sql);
    });
    
    console.log('--- SQL语句结束 ---\n');
    
    // 尝试创建一个测试产品来验证字段映射
    console.log('尝试创建测试产品验证字段映射...');
    try {
        const testProduct = {
            name: '测试商品',
            category: '测试分类',
            purchase_price: 1.50,
            retail_price: 3.00,
            input_price: 2.00,
            current_stock: 10,
            stock_alert: 5,
            unit: '个',
            created_by: 'system',
            updated_by: 'system'
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('products')
            .insert([testProduct])
            .select();
            
        if (insertError) {
            console.error('插入测试产品失败:', insertError.message);
            console.error('错误详情:', insertError);
            
            // 分析错误类型
            if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
                console.log('\n❌ 确认字段缺失，需要手动添加上述SQL语句中的字段');
            }
        } else {
            console.log('✅ 测试产品创建成功:', insertData);
            
            // 删除测试产品
            if (insertData && insertData.length > 0) {
                await supabase
                    .from('products')
                    .delete()
                    .eq('id', insertData[0].id);
                console.log('✅ 测试产品已清理');
            }
        }
    } catch (err) {
        console.error('测试产品创建异常:', err.message);
    }
}

addProductFields().then(() => {
    console.log('\n脚本执行完成');
    console.log('如果看到字段缺失错误，请按照上述提示在Supabase管理界面手动添加字段');
    process.exit(0);
}).catch(err => {
    console.error('脚本执行失败:', err);
    process.exit(1);
});