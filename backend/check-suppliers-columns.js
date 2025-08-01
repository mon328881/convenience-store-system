require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSuppliersColumns() {
  console.log('🔍 检查suppliers表字段结构...\n');
  
  try {
    // 查询表结构
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'suppliers' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      console.log('❌ 查询表结构失败，尝试直接查询数据...');
      
      // 尝试查询一条数据来了解字段
      const { data: sampleData, error: sampleError } = await supabase
        .from('suppliers')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.error('查询失败:', sampleError);
        return;
      }
      
      console.log('📋 当前suppliers表字段:');
      if (sampleData && sampleData.length > 0) {
        const fields = Object.keys(sampleData[0]);
        fields.forEach(field => {
          console.log(`  - ${field}: ${field === 'updated_by' ? '✅ 存在' : '📝 存在'}`);
        });
        
        const hasUpdatedBy = fields.includes('updated_by');
        console.log(`\n🎯 updated_by字段: ${hasUpdatedBy ? '✅ 存在' : '❌ 缺失'}`);
        
        if (!hasUpdatedBy) {
          console.log('\n🔧 需要执行的SQL:');
          console.log('ALTER TABLE suppliers ADD COLUMN updated_by VARCHAR(100) DEFAULT \'system\';');
        }
      } else {
        console.log('表中暂无数据，无法检查字段结构');
      }
    } else {
      console.log('📋 suppliers表字段结构:');
      data.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      const hasUpdatedBy = data.some(col => col.column_name === 'updated_by');
      console.log(`\n🎯 updated_by字段: ${hasUpdatedBy ? '✅ 存在' : '❌ 缺失'}`);
      
      if (!hasUpdatedBy) {
        console.log('\n🔧 需要执行的SQL:');
        console.log('ALTER TABLE suppliers ADD COLUMN updated_by VARCHAR(100) DEFAULT \'system\';');
      }
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkSuppliersColumns();
