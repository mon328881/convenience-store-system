require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function createTables() {
    console.log('🚀 直接创建Supabase表...');
    
    try {
        // 创建suppliers表
        console.log('📝 创建suppliers表...');
        const { data: suppliersResult, error: suppliersError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS suppliers (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    contact VARCHAR(255),
                    phone VARCHAR(50),
                    address TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });
        
        if (suppliersError) {
            console.error('❌ 创建suppliers表失败:', suppliersError);
        } else {
            console.log('✅ suppliers表创建成功');
        }

        // 创建products表
        console.log('📝 创建products表...');
        const { data: productsResult, error: productsError } = await supabase.rpc('exec_sql', {
            sql: `
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
            `
        });
        
        if (productsError) {
            console.error('❌ 创建products表失败:', productsError);
        } else {
            console.log('✅ products表创建成功');
        }

        // 创建inbound_records表
        console.log('📝 创建inbound_records表...');
        const { data: inboundResult, error: inboundError } = await supabase.rpc('exec_sql', {
            sql: `
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
            `
        });
        
        if (inboundError) {
            console.error('❌ 创建inbound_records表失败:', inboundError);
        } else {
            console.log('✅ inbound_records表创建成功');
        }

        // 创建outbound_records表
        console.log('📝 创建outbound_records表...');
        const { data: outboundResult, error: outboundError } = await supabase.rpc('exec_sql', {
            sql: `
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
            `
        });
        
        if (outboundError) {
            console.error('❌ 创建outbound_records表失败:', outboundError);
        } else {
            console.log('✅ outbound_records表创建成功');
        }

        console.log('🎉 表创建完成！');
        
    } catch (error) {
        console.error('❌ 创建表过程中出现错误:', error);
    }
}

createTables();