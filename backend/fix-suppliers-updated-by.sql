-- 修复suppliers表缺少updated_by字段的问题
-- 请在Supabase控制台的SQL Editor中执行此脚本

-- 为suppliers表添加updated_by字段
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100) DEFAULT 'system';

-- 为现有数据设置默认值
UPDATE suppliers SET updated_by = 'system' WHERE updated_by IS NULL;

-- 验证修复结果
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
AND table_schema = 'public'
AND column_name = 'updated_by';

-- 查看表中的数据示例
SELECT id, name, updated_by FROM suppliers LIMIT 3;