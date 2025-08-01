-- 为 inbound_records 表添加系统字段
-- 这些字段用于跟踪记录的创建者和更新者

-- 添加 created_by 字段
ALTER TABLE inbound_records 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) DEFAULT 'system';

-- 添加 updated_by 字段  
ALTER TABLE inbound_records 
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255) DEFAULT 'system';

-- 添加 updated_at 字段
ALTER TABLE inbound_records 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 创建触发器函数来自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 inbound_records 表创建触发器
DROP TRIGGER IF EXISTS update_inbound_records_updated_at ON inbound_records;
CREATE TRIGGER update_inbound_records_updated_at
    BEFORE UPDATE ON inbound_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 验证字段是否添加成功
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'inbound_records' 
  AND column_name IN ('created_by', 'updated_by', 'updated_at')
ORDER BY column_name;

-- 显示表结构
\d inbound_records;