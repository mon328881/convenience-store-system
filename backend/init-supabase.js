// 加载环境变量
require('dotenv').config();

const { supabase } = require('./src/config/supabase');

async function createTablesAndData() {
    console.log('🚀 开始创建 Supabase 数据库表和测试数据...');
    
    try {
        // 创建表结构的 SQL
        const createTablesSQL = `
-- 创建供应商表
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    brand VARCHAR(100),
    supplier_id INTEGER REFERENCES suppliers(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建入库记录表
CREATE TABLE IF NOT EXISTS inbound_records (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建出库记录表
CREATE TABLE IF NOT EXISTS outbound_records (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    customer_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_inbound_date ON inbound_records(date);
CREATE INDEX IF NOT EXISTS idx_outbound_date ON outbound_records(date);
        `;

        console.log('📊 创建数据库表结构...');
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
        
        if (createError) {
            console.error('❌ 创建表结构失败:', createError);
            // 尝试使用 SQL Editor 方式
            console.log('🔄 请手动在 Supabase SQL Editor 中执行以下 SQL:');
            console.log(createTablesSQL);
            return;
        }

        console.log('✅ 数据库表结构创建成功');

        // 检查是否已有数据
        const { data: existingSuppliers } = await supabase.from('suppliers').select('id').limit(1);
        
        if (existingSuppliers && existingSuppliers.length > 0) {
            console.log('📋 数据库中已有数据，跳过插入测试数据');
            return;
        }

        console.log('📝 插入测试数据...');

        // 插入供应商数据
        const { data: suppliers, error: suppliersError } = await supabase
            .from('suppliers')
            .insert([
                { name: '可口可乐公司', contact: '张经理', phone: '138-0000-1111', address: '北京市朝阳区' },
                { name: '康师傅食品', contact: '李经理', phone: '138-0000-2222', address: '上海市浦东新区' },
                { name: '农夫山泉', contact: '王经理', phone: '138-0000-3333', address: '杭州市西湖区' }
            ])
            .select();

        if (suppliersError) {
            console.error('❌ 插入供应商数据失败:', suppliersError);
            return;
        }

        console.log('✅ 供应商数据插入成功');

        // 插入商品数据
        const { data: products, error: productsError } = await supabase
            .from('products')
            .insert([
                { name: '可口可乐 330ml', price: 3.50, stock: 100, category: '饮料', brand: '可口可乐', supplier_id: suppliers[0].id, status: 'active' },
                { name: '康师傅方便面', price: 4.50, stock: 5, category: '食品', brand: '康师傅', supplier_id: suppliers[1].id, status: 'active' },
                { name: '矿泉水 500ml', price: 2.00, stock: 8, category: '饮料', brand: '农夫山泉', supplier_id: suppliers[2].id, status: 'active' },
                { name: '薯片', price: 6.80, stock: 25, category: '零食', brand: '乐事', supplier_id: suppliers[1].id, status: 'active' },
                { name: '旺旺雪饼', price: 8.90, stock: 3, category: '零食', brand: '旺旺', supplier_id: suppliers[1].id, status: 'active' },
                { name: '牛奶 250ml', price: 5.20, stock: 15, category: '饮料', brand: '蒙牛', supplier_id: suppliers[0].id, status: 'active' },
                { name: '面包', price: 12.00, stock: 0, category: '食品', brand: '桃李', supplier_id: suppliers[1].id, status: 'active' },
                { name: '酸奶', price: 8.50, stock: 2, category: '饮料', brand: '伊利', supplier_id: suppliers[0].id, status: 'active' }
            ])
            .select();

        if (productsError) {
            console.error('❌ 插入商品数据失败:', productsError);
            return;
        }

        console.log('✅ 商品数据插入成功');

        // 插入入库记录
        const { error: inboundError } = await supabase
            .from('inbound_records')
            .insert([
                { product_id: products[0].id, supplier_id: suppliers[0].id, quantity: 50, unit_price: 3.00, total_amount: 150.00, date: '2024-01-15', notes: '春节备货' },
                { product_id: products[1].id, supplier_id: suppliers[1].id, quantity: 30, unit_price: 4.00, total_amount: 120.00, date: '2024-01-16', notes: '新品上架' },
                { product_id: products[2].id, supplier_id: suppliers[2].id, quantity: 40, unit_price: 1.80, total_amount: 72.00, date: '2024-01-17', notes: '补充库存' },
                { product_id: products[3].id, supplier_id: suppliers[1].id, quantity: 20, unit_price: 6.00, total_amount: 120.00, date: '2024-01-18', notes: '零食补货' },
                { product_id: products[4].id, supplier_id: suppliers[1].id, quantity: 15, unit_price: 8.00, total_amount: 120.00, date: '2024-01-19', notes: '热销商品' },
                { product_id: products[5].id, supplier_id: suppliers[0].id, quantity: 25, unit_price: 4.80, total_amount: 120.00, date: '2024-01-20', notes: '乳制品补货' }
            ]);

        if (inboundError) {
            console.error('❌ 插入入库记录失败:', inboundError);
            return;
        }

        console.log('✅ 入库记录插入成功');

        // 插入出库记录
        const { error: outboundError } = await supabase
            .from('outbound_records')
            .insert([
                { product_id: products[0].id, quantity: 10, unit_price: 3.50, total_amount: 35.00, date: '2024-01-18', customer_name: '张三', notes: '零售' },
                { product_id: products[1].id, quantity: 5, unit_price: 4.50, total_amount: 22.50, date: '2024-01-19', customer_name: '李四', notes: '零售' },
                { product_id: products[2].id, quantity: 2, unit_price: 2.00, total_amount: 4.00, date: '2024-01-20', customer_name: '王五', notes: '零售' },
                { product_id: products[3].id, quantity: 3, unit_price: 6.80, total_amount: 20.40, date: '2024-01-21', customer_name: '赵六', notes: '零售' },
                { product_id: products[4].id, quantity: 2, unit_price: 8.90, total_amount: 17.80, date: '2024-01-22', customer_name: '孙七', notes: '零售' }
            ]);

        if (outboundError) {
            console.error('❌ 插入出库记录失败:', outboundError);
            return;
        }

        console.log('✅ 出库记录插入成功');

        // 验证数据
        const { data: supplierCount } = await supabase.from('suppliers').select('*', { count: 'exact' });
        const { data: productCount } = await supabase.from('products').select('*', { count: 'exact' });
        
        console.log('📊 数据验证:');
        console.log(`   供应商数量: ${supplierCount?.length || 0}`);
        console.log(`   商品数量: ${productCount?.length || 0}`);
        
        console.log('🎉 Supabase 数据库初始化完成！');

    } catch (error) {
        console.error('❌ 初始化过程中出现错误:', error);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    createTablesAndData().then(() => {
        console.log('✅ 脚本执行完成');
        process.exit(0);
    }).catch(error => {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    });
}

module.exports = createTablesAndData;