-- 为入库记录表添加缺失的created_by和updated_by字段
-- 解决"Could not find the 'created_by' column"错误

-- 添加created_by字段
ALTER TABLE inbound_records 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) DEFAULT 'system';

-- 添加updated_by字段
ALTER TABLE inbound_records 
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100) DEFAULT 'system';

-- 添加updated_at字段（如果不存在）
ALTER TABLE inbound_records 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 为出库记录表也添加相同字段（保持一致性）
ALTER TABLE outbound_records 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) DEFAULT 'system';

ALTER TABLE outbound_records 
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100) DEFAULT 'system';

ALTER TABLE outbound_records 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 为入库记录表添加更新时间触发器
DROP TRIGGER IF EXISTS update_inbound_records_updated_at ON inbound_records;
CREATE TRIGGER update_inbound_records_updated_at BEFORE UPDATE ON inbound_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为出库记录表添加更新时间触发器
DROP TRIGGER IF EXISTS update_outbound_records_updated_at ON outbound_records;
CREATE TRIGGER update_outbound_records_updated_at BEFORE UPDATE ON outbound_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 验证字段添加结果
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'inbound_records' 
  AND column_name IN ('created_by', 'updated_by', 'updated_at')
ORDER BY column_name;