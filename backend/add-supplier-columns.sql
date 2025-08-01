-- 为suppliers表添加缺失的字段
-- 请在Supabase控制台的SQL Editor中执行此脚本

-- 添加供货商品字段 (JSON数组)
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]'::jsonb;

-- 添加付款方式字段
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- 添加是否开票字段
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS need_invoice BOOLEAN DEFAULT false;

-- 添加状态字段
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 添加备注字段
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notes TEXT;

-- 验证字段是否添加成功
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
ORDER BY ordinal_position;