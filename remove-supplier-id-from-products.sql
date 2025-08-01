-- 清理products表中冗余的supplier_id字段
-- 由于已改为多对多关系，通过supplier_products中间表管理关联关系

-- 1. 删除外键约束（如果存在）
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_supplier;

-- 2. 删除相关索引（如果存在）
DROP INDEX IF EXISTS idx_products_supplier_id;

-- 3. 删除supplier_id字段
ALTER TABLE products DROP COLUMN IF EXISTS supplier_id;

-- 验证删除结果
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;