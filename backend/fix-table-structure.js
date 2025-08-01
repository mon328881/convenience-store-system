const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg0MTYxOCwiZXhwIjoyMDY5NDE3NjE4fQ.6YP06hp4dKbPHXc_2-aAcQ_ACttb3EGa97VKXuFBsb4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTableStructure() {
  console.log('=== 修复表结构问题 ===\n');
  
  try {
    // 1. 为 products 表添加 barcode 字段
    console.log('🔧 为 products 表添加 barcode 字段...');
    
    // 检查字段是否已存在
    const { data: existingData, error: checkError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('❌ 无法访问 products 表:', checkError.message);
      return;
    }
    
    const hasBarcode = existingData && existingData.length > 0 && 'barcode' in existingData[0];
    const hasUnit = existingData && existingData.length > 0 && 'unit' in existingData[0];
    
    console.log(`📋 当前字段状态:`);
    console.log(`  - barcode: ${hasBarcode ? '✅ 存在' : '❌ 缺失'}`);
    console.log(`  - unit: ${hasUnit ? '✅ 存在' : '❌ 缺失'}`);
    
    if (!hasBarcode) {
      console.log('⚠️  需要手动在 Supabase 控制台执行以下 SQL:');
      console.log(`
-- 为 products 表添加 barcode 字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);

-- 为现有商品添加示例条形码
UPDATE products SET barcode = 'PROD' || LPAD(id::text, 6, '0') WHERE barcode IS NULL;

-- 创建条形码唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
      `);
    }
    
    if (!hasUnit) {
      console.log('⚠️  需要手动在 Supabase 控制台执行以下 SQL:');
      console.log(`
-- 为 products 表添加 unit 字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT '个';
      `);
    }
    
    // 2. 测试修复后的插入操作
    console.log('\n🧪 测试修复后的数据操作...');
    
    const testData = {
      name: '测试商品',
      category: '测试分类',
      brand: '测试品牌',
      unit: '个',
      purchase_price: 10.00,
      retail_price: 15.00,
      stock_alert: 5,
      current_stock: 100
    };
    
    // 如果有 barcode 字段，添加到测试数据中
    if (hasBarcode) {
      testData.barcode = 'TEST' + Date.now();
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.log('❌ 插入测试失败:', insertError.message);
      
      // 分析错误原因
      if (insertError.message.includes('barcode')) {
        console.log('💡 建议: 需要添加 barcode 字段');
      }
      if (insertError.message.includes('unit')) {
        console.log('💡 建议: 需要添加 unit 字段');
      }
      if (insertError.message.includes('total_amount')) {
        console.log('💡 建议: 需要添加 total_amount 字段或设置默认值');
      }
    } else {
      console.log('✅ 插入测试成功');
      
      // 清理测试数据
      if (insertData && insertData.length > 0) {
        await supabase
          .from('products')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 测试数据已清理');
      }
    }
    
    // 3. 检查 inbound_records 和 outbound_records 表的 total_amount 字段
    console.log('\n🔍 检查 inbound_records 和 outbound_records 表...');
    
    const tables = ['inbound_records', 'outbound_records'];
    for (const table of tables) {
      const { data: sampleData, error: sampleError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!sampleError && sampleData && sampleData.length > 0) {
        const hasTotalAmount = 'total_amount' in sampleData[0];
        console.log(`📋 ${table} - total_amount: ${hasTotalAmount ? '✅ 存在' : '❌ 缺失'}`);
        
        if (!hasTotalAmount) {
          console.log(`⚠️  ${table} 表缺少 total_amount 字段，需要手动添加`);
        }
      }
    }
    
    console.log('\n=== 表结构检查完成 ===');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
  }
}

fixTableStructure().catch(console.error);