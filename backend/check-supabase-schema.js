require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkSupabaseSchema() {
    console.log('🔍 检查Supabase表结构...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ 缺少Supabase环境变量');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // 检查products表结构
        console.log('\n📦 Products表结构:');
        const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .limit(1);
        
        if (productsError) {
            console.log('Products表错误:', productsError);
        } else {
            console.log('Products表查询成功，字段结构可以通过插入测试数据来确认');
        }
        
        // 检查suppliers表结构
        console.log('\n🏢 Suppliers表结构:');
        const { data: suppliersData, error: suppliersError } = await supabase
            .from('suppliers')
            .select('*')
            .limit(1);
        
        if (suppliersError) {
            console.log('Suppliers表错误:', suppliersError);
        } else {
            console.log('Suppliers表查询成功');
        }
        
        // 尝试插入测试数据来确认字段结构
        console.log('\n🧪 测试插入数据以确认字段结构...');
        
        // 测试products表
        const { data: testProduct, error: productInsertError } = await supabase
            .from('products')
            .insert({
                name: '测试产品',
                price: 10.99,
                stock: 100,
                supplier_id: null
            })
            .select();
        
        if (productInsertError) {
            console.log('Products插入错误:', productInsertError);
        } else {
            console.log('Products插入成功:', testProduct);
            // 删除测试数据
            await supabase.from('products').delete().eq('name', '测试产品');
        }
        
        // 测试suppliers表
        const { data: testSupplier, error: supplierInsertError } = await supabase
            .from('suppliers')
            .insert({
                name: '测试供应商',
                contact: '测试联系人',
                phone: '123456789'
            })
            .select();
        
        if (supplierInsertError) {
            console.log('Suppliers插入错误:', supplierInsertError);
        } else {
            console.log('Suppliers插入成功:', testSupplier);
            // 删除测试数据
            await supabase.from('suppliers').delete().eq('name', '测试供应商');
        }
        
    } catch (error) {
        console.error('❌ 检查表结构时出错:', error);
    }
}

checkSupabaseSchema();