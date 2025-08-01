const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { supabase } = require('./src/config/supabase');

async function createSampleData() {
    try {
        console.log('🌱 创建示例数据...\n');
        
        // 1. 创建示例供应商
        console.log('📊 创建示例供应商...');
        const suppliers = [
            {
                id: 'supplier-001',
                name: '华为技术有限公司',
                contact: '张经理',
                phone: '13800138001',
                address: '深圳市龙岗区华为基地'
            },
            {
                id: 'supplier-002',
                name: '小米科技有限公司',
                contact: '李经理',
                phone: '13800138002',
                address: '北京市海淀区小米科技园'
            },
            {
                id: 'supplier-003',
                name: '苹果电子产品公司',
                contact: 'John Smith',
                phone: '13800138003',
                address: '上海市浦东新区苹果大厦'
            }
        ];
        
        const { data: supplierData, error: supplierError } = await supabase
            .from('suppliers')
            .insert(suppliers);
        
        if (supplierError) {
            console.log('❌ 供应商创建失败:', supplierError);
        } else {
            console.log(`✅ 成功创建 ${suppliers.length} 个供应商`);
        }
        
        // 2. 创建示例产品
        console.log('\n📦 创建示例产品...');
        const products = [
            {
                id: 'product-001',
                name: 'iPhone 15 Pro',
                price: 7999.00,
                stock: 50,
                category: '手机',
                brand: '苹果',
                supplier_id: 'supplier-003',
                status: 'active'
            },
            {
                id: 'product-002',
                name: 'Mate 60 Pro',
                price: 6999.00,
                stock: 30,
                category: '手机',
                brand: '华为',
                supplier_id: 'supplier-001',
                status: 'active'
            },
            {
                id: 'product-003',
                name: '小米14 Ultra',
                price: 5999.00,
                stock: 25,
                category: '手机',
                brand: '小米',
                supplier_id: 'supplier-002',
                status: 'active'
            },
            {
                id: 'product-004',
                name: 'MacBook Pro 16英寸',
                price: 19999.00,
                stock: 15,
                category: '笔记本电脑',
                brand: '苹果',
                supplier_id: 'supplier-003',
                status: 'active'
            },
            {
                id: 'product-005',
                name: 'MateBook X Pro',
                price: 8999.00,
                stock: 20,
                category: '笔记本电脑',
                brand: '华为',
                supplier_id: 'supplier-001',
                status: 'active'
            }
        ];
        
        const { data: productData, error: productError } = await supabase
            .from('products')
            .insert(products);
        
        if (productError) {
            console.log('❌ 产品创建失败:', productError);
        } else {
            console.log(`✅ 成功创建 ${products.length} 个产品`);
        }
        
        // 3. 创建示例入库记录
        console.log('\n📥 创建示例入库记录...');
        const inboundRecords = [
            {
                id: 'inbound-001',
                product_id: 'product-001',
                supplier_id: 'supplier-003',
                quantity: 100,
                unit_price: 7500.00,
                total_amount: 750000.00,
                date: '2024-01-15',
                notes: '首批iPhone 15 Pro进货'
            },
            {
                id: 'inbound-002',
                product_id: 'product-002',
                supplier_id: 'supplier-001',
                quantity: 80,
                unit_price: 6500.00,
                total_amount: 520000.00,
                date: '2024-01-20',
                notes: 'Mate 60 Pro补货'
            },
            {
                id: 'inbound-003',
                product_id: 'product-004',
                supplier_id: 'supplier-003',
                quantity: 30,
                unit_price: 18000.00,
                total_amount: 540000.00,
                date: '2024-01-25',
                notes: 'MacBook Pro新品到货'
            }
        ];
        
        const { data: inboundData, error: inboundError } = await supabase
            .from('inbound_records')
            .insert(inboundRecords);
        
        if (inboundError) {
            console.log('❌ 入库记录创建失败:', inboundError);
        } else {
            console.log(`✅ 成功创建 ${inboundRecords.length} 条入库记录`);
        }
        
        // 4. 创建示例出库记录
        console.log('\n📤 创建示例出库记录...');
        const outboundRecords = [
            {
                id: 'outbound-001',
                product_id: 'product-001',
                quantity: 50,
                unit_price: 7999.00,
                total_amount: 399950.00,
                date: '2024-02-01',
                customer_name: '北京科技有限公司',
                notes: '企业批量采购'
            },
            {
                id: 'outbound-002',
                product_id: 'product-002',
                quantity: 50,
                unit_price: 6999.00,
                total_amount: 349950.00,
                date: '2024-02-05',
                customer_name: '上海贸易公司',
                notes: '零售渠道销售'
            },
            {
                id: 'outbound-003',
                product_id: 'product-004',
                quantity: 15,
                unit_price: 19999.00,
                total_amount: 299985.00,
                date: '2024-02-10',
                customer_name: '深圳设计工作室',
                notes: '设计师专用设备'
            }
        ];
        
        const { data: outboundData, error: outboundError } = await supabase
            .from('outbound_records')
            .insert(outboundRecords);
        
        if (outboundError) {
            console.log('❌ 出库记录创建失败:', outboundError);
        } else {
            console.log(`✅ 成功创建 ${outboundRecords.length} 条出库记录`);
        }
        
        console.log('\n🎉 示例数据创建完成！');
        
        // 验证数据
        console.log('\n📊 数据统计:');
        const { count: supplierCount } = await supabase
            .from('suppliers')
            .select('*', { count: 'exact', head: true });
        console.log(`供应商总数: ${supplierCount}`);
        
        const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
        console.log(`产品总数: ${productCount}`);
        
        const { count: inboundCount } = await supabase
            .from('inbound_records')
            .select('*', { count: 'exact', head: true });
        console.log(`入库记录总数: ${inboundCount}`);
        
        const { count: outboundCount } = await supabase
            .from('outbound_records')
            .select('*', { count: 'exact', head: true });
        console.log(`出库记录总数: ${outboundCount}`);
        
    } catch (error) {
        console.error('❌ 示例数据创建失败:', error);
    }
}

createSampleData().catch(console.error);