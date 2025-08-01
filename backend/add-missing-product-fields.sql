-- 为products表添加缺失的字段
-- 这些字段在前端代码中被使用，但数据库表中缺失

-- 添加createdBy字段（操作员）
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) DEFAULT 'system';

-- 添加updatedBy字段（更新操作员）
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100) DEFAULT 'system';

-- 添加其他可能缺失的商品字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS input_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specification VARCHAR(255) DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT '个';
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_inbound INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_outbound INTEGER DEFAULT 0;

-- 更新现有记录的created_by字段
UPDATE products SET created_by = 'system' WHERE created_by IS NULL;
UPDATE products SET updated_by = 'system' WHERE updated_by IS NULL;

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);