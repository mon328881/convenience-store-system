require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少Supabase环境变量');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
    try {
        console.log('🔍 验证Supabase数据...\n');

        // 检查供应商数据
        console.log('📊 供应商数据:');
        const { data: suppliers, error: suppliersError } = await supabase
            .from('suppliers')
            .select('*')
            .order('id');
        
        if (suppliersError) {
            console.log('❌ 查询供应商失败:', suppliersError);
        } else {
            console.log(`✅ 找到 ${suppliers.length} 个供应商:`);
            suppliers.forEach(supplier => {
                console.log(`  - ID: ${supplier.id}, 名称: ${supplier.name}, 联系人: ${supplier.contact}`);
            });
        }

        console.log('\n📦 产品数据:');
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
                *,
                suppliers (
                    name
                )
            `)
            .order('id');
        
        if (productsError) {
            console.log('❌ 查询产品失败:', productsError);
        } else {
            console.log(`✅ 找到 ${products.length} 个产品:`);
            products.forEach(product => {
                console.log(`  - ID: ${product.id}, 名称: ${product.name}, 价格: ¥${product.price}, 库存: ${product.stock}, 供应商: ${product.suppliers?.name || '未知'}`);
            });
        }

        console.log('\n📥 入库记录:');
        const { data: inbounds, error: inboundsError } = await supabase
            .from('inbound_records')
            .select('*')
            .order('id');
        
        if (inboundsError) {
            console.log('❌ 查询入库记录失败:', inboundsError);
        } else {
            console.log(`✅ 找到 ${inbounds.length} 条入库记录`);
        }

        console.log('\n📤 出库记录:');
        const { data: outbounds, error: outboundsError } = await supabase
            .from('outbound_records')
            .select('*')
            .order('id');
        
        if (outboundsError) {
            console.log('❌ 查询出库记录失败:', outboundsError);
        } else {
            console.log(`✅ 找到 ${outbounds.length} 条出库记录`);
        }

        console.log('\n🎉 数据验证完成！');

    } catch (error) {
        console.error('❌ 验证过程中出错:', error);
    }
}

verifyData();