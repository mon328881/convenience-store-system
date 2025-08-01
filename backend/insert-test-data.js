require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function insertTestData() {
    console.log('🔄 插入测试数据到Supabase...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ 缺少Supabase环境变量');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // 清空现有数据
        console.log('🗑️ 清空现有数据...');
        await supabase.from('outbound_records').delete().neq('id', 0);
        await supabase.from('inbound_records').delete().neq('id', 0);
        await supabase.from('products').delete().neq('id', 0);
        await supabase.from('suppliers').delete().neq('id', 0);
        
        // 插入供应商数据
        console.log('🏢 插入供应商数据...');
        const { data: suppliers, error: suppliersError } = await supabase
            .from('suppliers')
            .insert([
                {
                    name: '可口可乐公司',
                    contact: '张经理',
                    phone: '010-12345678',
                    address: '北京市朝阳区'
                },
                {
                    name: '康师傅食品',
                    contact: '李经理',
                    phone: '021-87654321',
                    address: '上海市浦东新区'
                },
                {
                    name: '统一企业',
                    contact: '王经理',
                    phone: '020-11223344',
                    address: '广州市天河区'
                }
            ])
            .select();
        
        if (suppliersError) {
            console.error('❌ 供应商数据插入失败:', suppliersError);
            return;
        }
        console.log('✅ 供应商数据插入成功:', suppliers.length, '条');
        
        // 插入产品数据
        console.log('📦 插入产品数据...');
        const { data: products, error: productsError } = await supabase
            .from('products')
            .insert([
                {
                    name: '可口可乐 330ml',
                    price: 3.50,
                    stock: 100,
                    category: '饮料',
                    brand: '可口可乐',
                    supplier_id: suppliers[0].id,
                    status: 'active'
                },
                {
                    name: '康师傅红烧牛肉面',
                    price: 4.50,
                    stock: 50,
                    category: '方便面',
                    brand: '康师傅',
                    supplier_id: suppliers[1].id,
                    status: 'active'
                },
                {
                    name: '统一绿茶 500ml',
                    price: 3.00,
                    stock: 80,
                    category: '饮料',
                    brand: '统一',
                    supplier_id: suppliers[2].id,
                    status: 'active'
                },
                {
                    name: '薯片原味',
                    price: 6.00,
                    stock: 30,
                    category: '零食',
                    brand: '乐事',
                    supplier_id: suppliers[0].id,
                    status: 'active'
                },
                {
                    name: '矿泉水 550ml',
                    price: 2.00,
                    stock: 200,
                    category: '饮料',
                    brand: '农夫山泉',
                    supplier_id: suppliers[1].id,
                    status: 'active'
                }
            ])
            .select();
        
        if (productsError) {
            console.error('❌ 产品数据插入失败:', productsError);
            return;
        }
        console.log('✅ 产品数据插入成功:', products.length, '条');
        
        // 插入入库记录
        console.log('📥 插入入库记录...');
        const { data: inboundRecords, error: inboundError } = await supabase
            .from('inbound_records')
            .insert([
                {
                    product_id: products[0].id,
                    supplier_id: suppliers[0].id,
                    quantity: 50,
                    unit_price: 3.00,
                    total_amount: 150.00,
                    date: '2024-01-15',
                    notes: '首次进货'
                },
                {
                    product_id: products[1].id,
                    supplier_id: suppliers[1].id,
                    quantity: 30,
                    unit_price: 4.00,
                    total_amount: 120.00,
                    date: '2024-01-16',
                    notes: '补充库存'
                },
                {
                    product_id: products[2].id,
                    supplier_id: suppliers[2].id,
                    quantity: 40,
                    unit_price: 2.50,
                    total_amount: 100.00,
                    date: '2024-01-17',
                    notes: '新品进货'
                }
            ])
            .select();
        
        if (inboundError) {
            console.error('❌ 入库记录插入失败:', inboundError);
            return;
        }
        console.log('✅ 入库记录插入成功:', inboundRecords.length, '条');
        
        // 插入出库记录
        console.log('📤 插入出库记录...');
        const { data: outboundRecords, error: outboundError } = await supabase
            .from('outbound_records')
            .insert([
                {
                    product_id: products[0].id,
                    quantity: 5,
                    unit_price: 3.50,
                    total_amount: 17.50,
                    date: '2024-01-18',
                    customer_name: '张三',
                    notes: '零售销售'
                },
                {
                    product_id: products[1].id,
                    quantity: 2,
                    unit_price: 4.50,
                    total_amount: 9.00,
                    date: '2024-01-18',
                    customer_name: '李四',
                    notes: '零售销售'
                },
                {
                    product_id: products[2].id,
                    quantity: 3,
                    unit_price: 3.00,
                    total_amount: 9.00,
                    date: '2024-01-19',
                    customer_name: '王五',
                    notes: '零售销售'
                }
            ])
            .select();
        
        if (outboundError) {
            console.error('❌ 出库记录插入失败:', outboundError);
            return;
        }
        console.log('✅ 出库记录插入成功:', outboundRecords.length, '条');
        
        console.log('\n🎉 测试数据插入完成！');
        
        // 验证数据
        console.log('\n📊 数据验证:');
        const { data: supplierCount } = await supabase.from('suppliers').select('*', { count: 'exact' });
        const { data: productCount } = await supabase.from('products').select('*', { count: 'exact' });
        const { data: inboundCount } = await supabase.from('inbound_records').select('*', { count: 'exact' });
        const { data: outboundCount } = await supabase.from('outbound_records').select('*', { count: 'exact' });
        
        console.log('🏢 供应商:', supplierCount?.length || 0, '条');
        console.log('📦 产品:', productCount?.length || 0, '条');
        console.log('📥 入库记录:', inboundCount?.length || 0, '条');
        console.log('📤 出库记录:', outboundCount?.length || 0, '条');
        
    } catch (error) {
        console.error('❌ 插入测试数据时出错:', error);
    }
}

insertTestData();