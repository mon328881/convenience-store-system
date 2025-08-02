require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 更新Supabase表结构以支持数据迁移');
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

async function updateSupabaseSchema() {
    try {
        console.log('🔧 更新products表，添加barcode字段...');
        
        // 添加barcode字段到products表
        const { data: addBarcodeResult, error: addBarcodeError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(255);'
        });
        
        if (addBarcodeError) {
            console.log('⚠️ 添加barcode字段可能已存在:', addBarcodeError.message);
        } else {
            console.log('✅ 成功添加barcode字段到products表');
        }
        
        console.log('🔧 更新suppliers表，添加email字段...');
        
        // 添加email字段到suppliers表
        const { data: addEmailResult, error: addEmailError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email VARCHAR(255);'
        });
        
        if (addEmailError) {
            console.log('⚠️ 添加email字段可能已存在:', addEmailError.message);
        } else {
            console.log('✅ 成功添加email字段到suppliers表');
        }
        
        // 验证表结构
        console.log('\n📋 验证更新后的表结构...');
        
        // 检查products表结构
        const { data: productsSchema, error: productsError } = await supabase
            .from('products')
            .select('*')
            .limit(1);
            
        if (productsError) {
            console.error('❌ 检查products表失败:', productsError);
        } else {
            console.log('✅ products表结构验证成功');
        }
        
        // 检查suppliers表结构
        const { data: suppliersSchema, error: suppliersError } = await supabase
            .from('suppliers')
            .select('*')
            .limit(1);
            
        if (suppliersError) {
            console.error('❌ 检查suppliers表失败:', suppliersError);
        } else {
            console.log('✅ suppliers表结构验证成功');
        }
        
        console.log('\n🎉 表结构更新完成！现在可以运行数据迁移了。');
        console.log('💡 请运行数据迁移脚本完成数据导入');
        
    } catch (error) {
        console.error('❌ 更新表结构失败:', error.message);
    }
}

updateSupabaseSchema();