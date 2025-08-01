-- 修复表结构问题

-- 1. 为 products 表添加 barcode 字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);

-- 2. 为 products 表添加 unit 字段（如果缺失）
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT '个';

-- 3. 创建 barcode 字段的唯一索引（可选，但推荐）
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

-- 4. 更新现有商品数据，添加示例条形码
UPDATE products SET barcode = 'TEST' || id::text WHERE barcode IS NULL;

-- 验证修复结果
SELECT 'products表字段检查' as check_type, 
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'products' AND column_name = 'barcode'
       ) THEN '✅ barcode字段存在' ELSE '❌ barcode字段缺失' END as result;