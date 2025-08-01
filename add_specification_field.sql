-- 为products表添加specification字段
ALTER TABLE products ADD COLUMN specification TEXT DEFAULT '';

-- 添加注释
COMMENT ON COLUMN products.specification IS '商品规格描述';