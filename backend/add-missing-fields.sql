-- 添加缺失的字段到现有表

-- 为 products 表添加 stock_alert 字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_alert INTEGER DEFAULT 10;

-- 为 outbound_records 表添加 status 字段（如果需要的话）
ALTER TABLE outbound_records ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- 更新现有商品的库存预警值（设置默认值）
UPDATE products SET stock_alert = 10 WHERE stock_alert IS NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_products_stock_alert ON products(stock_alert);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(stock) WHERE stock <= stock_alert;

-- 验证字段是否添加成功
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name IN ('stock', 'stock_alert');

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'outbound_records' AND column_name IN ('status');