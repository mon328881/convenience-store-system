-- 移除供应商表中的冗余 products 字段
ALTER TABLE suppliers DROP COLUMN IF EXISTS products;

-- 确保商品表的 supplier_id 外键约束正确
ALTER TABLE products 
ADD CONSTRAINT fk_products_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 为提高查询性能添加索引
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);