const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg0MTYxOCwiZXhwIjoyMDY5NDE3NjE4fQ.6YP06hp4dKbPHXc_2-aAcQ_ACttb3EGa97VKXuFBsb4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableColumns() {
  console.log('=== 检查数据库表结构 ===\n');
  
  const tables = ['suppliers', 'products', 'inbound_records', 'outbound_records'];
  
  for (const table of tables) {
    console.log(`🔍 检查表: ${table}`);
    
    try {
      // 查询表结构
      const { data, error } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = '${table}' 
            ORDER BY ordinal_position;
          `
        });
      
      if (error) {
        console.log(`❌ 查询${table}表结构失败: ${error.message}`);
        
        // 尝试直接查询一条记录来了解字段
        const { data: sampleData, error: sampleError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!sampleError && sampleData && sampleData.length > 0) {
          console.log(`📋 ${table}表字段:`, Object.keys(sampleData[0]).join(', '));
        }
      } else {
        console.log(`📋 ${table}表结构:`);
        if (data && data.length > 0) {
          data.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ 检查${table}时发生错误: ${error.message}`);
    }
    
    console.log('');
  }
}

checkTableColumns().catch(console.error);
