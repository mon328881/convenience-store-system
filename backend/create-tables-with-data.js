require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function createTablesWithData() {
    console.log('🚀 通过插入数据的方式创建Supabase表...');
    
    try {
        // 首先插入供应商数据
        console.log('📝 创建suppliers表并插入数据...');
        const { data: suppliers, error: suppliersError } = await supabase
            .from('suppliers')
            .insert([
                { name: '可口可乐公司', contact: '张经理', phone: '138-0000-1111', address: '北京市朝阳区' },
                { name: '康师傅食品', contact: '李经理', phone: '138-0000-2222', address: '上海市浦东新区' },
                { name: '农夫山泉', contact: '王经理', phone: '138-0000-3333', address: '杭州市西湖区' }
            ])
            .select();
        
        if (suppliersError) {
            console.error('❌ 创建suppliers表失败:', suppliersError);
            console.log('请确保您已在Supabase控制台的SQL Editor中执行了表创建脚本');
            return;
        } else {
            console.log('✅ suppliers表创建成功，插入了', suppliers.length, '条记录');
        }

        // 插入商品数据
        console.log('📝 创建products表并插入数据...');
        const { data: products, error: productsError } = await supabase
            .from('products')
            .insert([
                { name: '可口可乐 330ml', price: 3.50, stock: 100, category: '饮料', brand: '可口可乐', supplier_id: suppliers[0].id, status: 'active' },
                { name: '康师傅方便面', price: 4.50, stock: 5, category: '食品', brand: '康师傅', supplier_id: suppliers[1].id, status: 'active' },
                { name: '矿泉水 500ml', price: 2.00, stock: 8, category: '饮料', brand: '农夫山泉', supplier_id: suppliers[2].id, status: 'active' }
            ])
            .select();
        
        if (productsError) {
            console.error('❌ 创建products表失败:', productsError);
            return;
        } else {
            console.log('✅ products表创建成功，插入了', products.length, '条记录');
        }

        // 插入入库记录
        console.log('📝 创建inbound_records表并插入数据...');
        const { data: inbound, error: inboundError } = await supabase
            .from('inbound_records')
            .insert([
                { product_id: products[0].id, supplier_id: suppliers[0].id, quantity: 50, unit_price: 3.00, total_amount: 150.00, date: '2024-01-15', notes: '春节备货' },
                { product_id: products[1].id, supplier_id: suppliers[1].id, quantity: 30, unit_price: 4.00, total_amount: 120.00, date: '2024-01-16', notes: '新品上架' }
            ])
            .select();
        
        if (inboundError) {
            console.error('❌ 创建inbound_records表失败:', inboundError);
            return;
        } else {
            console.log('✅ inbound_records表创建成功，插入了', inbound.length, '条记录');
        }

        // 插入出库记录
        console.log('📝 创建outbound_records表并插入数据...');
        const { data: outbound, error: outboundError } = await supabase
            .from('outbound_records')
            .insert([
                { product_id: products[0].id, quantity: 10, unit_price: 3.50, total_amount: 35.00, date: '2024-01-18', customer_name: '张三', notes: '零售' },
                { product_id: products[1].id, quantity: 5, unit_price: 4.50, total_amount: 22.50, date: '2024-01-19', customer_name: '李四', notes: '零售' }
            ])
            .select();
        
        if (outboundError) {
            console.error('❌ 创建outbound_records表失败:', outboundError);
            return;
        } else {
            console.log('✅ outbound_records表创建成功，插入了', outbound.length, '条记录');
        }

        console.log('🎉 所有表创建完成！现在可以进行数据迁移了。');
        
    } catch (error) {
        console.error('❌ 创建表过程中出现错误:', error);
        console.log('\n📋 如果出现表不存在的错误，请按以下步骤操作：');
        console.log('1. 登录 Supabase 控制台');
        console.log('2. 进入您的项目');
        console.log('3. 点击左侧菜单的 "SQL Editor"');
        console.log('4. 运行: node sql-for-supabase.js 查看需要执行的SQL');
        console.log('5. 复制SQL到Supabase SQL Editor中执行');
    }
}

createTablesWithData();