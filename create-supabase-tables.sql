-- 便利店进销存系统 - Supabase数据库表结构
-- 请在Supabase控制台的SQL Editor中执行此脚本

-- 创建供应商表
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    contact VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    products TEXT[], -- 供货商品数组
    payment_method VARCHAR(50), -- 付款方式
    need_invoice BOOLEAN DEFAULT false, -- 是否需要发票
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    unit VARCHAR(20) DEFAULT '个',
    purchase_price DECIMAL(10,2) DEFAULT 0,
    input_price DECIMAL(10,2) DEFAULT 0,
    retail_price DECIMAL(10,2) DEFAULT 0,
    stock_alert INTEGER DEFAULT 10,
    current_stock INTEGER DEFAULT 0,
    total_inbound INTEGER DEFAULT 0,
    total_outbound INTEGER DEFAULT 0,
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
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_inbound_date ON inbound_records(date);
CREATE INDEX IF NOT EXISTS idx_outbound_date ON outbound_records(date);

-- 插入测试供应商数据
INSERT INTO suppliers (name, contact, phone, address, products, payment_method, need_invoice, status, notes) VALUES
('可口可乐公司', '张经理', '13800138001', '北京市朝阳区建国路88号', ARRAY['可乐', '雪碧', '芬达'], '月结', true, 'active', '主要饮料供应商'),
('康师傅食品', '李总监', '13800138002', '天津市河西区友谊路99号', ARRAY['方便面', '饼干', '饮料'], '银行转账', true, 'active', '食品类供应商'),
('宝洁日用品', '王主管', '13800138003', '上海市浦东新区陆家嘴环路1000号', ARRAY['洗发水', '牙膏', '洗衣粉'], '现金', false, 'active', '日用品供应商'),
('统一企业', '赵经理', '13800138004', '广州市天河区珠江新城', ARRAY['饮料', '方便面', '零食'], '月结', true, 'active', '综合食品供应商'),
('联合利华', '钱总', '13800138005', '深圳市南山区科技园', ARRAY['洗护用品', '清洁用品'], '银行转账', true, 'active', '日化用品供应商')
ON CONFLICT (name) DO NOTHING;

-- 插入测试商品数据
INSERT INTO products (name, category, brand, unit, purchase_price, input_price, retail_price, stock_alert, current_stock, supplier_id, status) VALUES
('可口可乐 330ml', '饮料', '可口可乐', '瓶', 2.50, 2.80, 3.50, 20, 100, 1, 'active'),
('雪碧 330ml', '饮料', '可口可乐', '瓶', 2.50, 2.80, 3.50, 20, 80, 1, 'active'),
('康师傅红烧牛肉面', '方便面', '康师傅', '包', 3.00, 3.30, 4.50, 15, 50, 2, 'active'),
('奥利奥饼干', '零食', '奥利奥', '包', 8.00, 8.50, 12.00, 10, 30, 2, 'active'),
('海飞丝洗发水 400ml', '日用品', '宝洁', '瓶', 25.00, 28.00, 35.00, 5, 20, 3, 'active')
ON CONFLICT DO NOTHING;