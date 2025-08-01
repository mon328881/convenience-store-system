const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDE2MTgsImV4cCI6MjA2OTQxNzYxOH0.2URx1Ur6TxpayNiqDsKxae0wbETzqhxoq_59LoikkFw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyRLS() {
  console.log('=== 验证RLS策略配置 ===\n');
  
  const tables = ['suppliers', 'products', 'inbound_records', 'outbound_records'];
  
  for (const table of tables) {
    console.log(`🔍 测试表: ${table}`);
    
    try {
      // 测试SELECT权限
      const { data: selectData, error: selectError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.log(`❌ SELECT失败: ${selectError.message}`);
      } else {
        console.log(`✅ SELECT成功，数据条数: ${selectData?.length || 0}`);
      }
      
      // 测试INSERT权限（使用测试数据）
      let testData = {};
      if (table === 'suppliers') {
        testData = { name: 'RLS测试供应商', contact: '测试联系人', phone: '123456789' };
      } else if (table === 'products') {
        testData = { name: 'RLS测试商品', barcode: 'TEST123', price: 10.00, stock: 100 };
      } else if (table === 'inbound_records') {
        testData = { product_id: 1, supplier_id: 1, quantity: 10, unit_price: 5.00 };
      } else if (table === 'outbound_records') {
        testData = { product_id: 1, quantity: 5, unit_price: 10.00 };
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from(table)
        .insert(testData)
        .select();
      
      if (insertError) {
        console.log(`❌ INSERT失败: ${insertError.message}`);
      } else {
        console.log(`✅ INSERT成功`);
        
        // 如果插入成功，尝试删除测试数据
        if (insertData && insertData.length > 0) {
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .eq('id', insertData[0].id);
          
          if (deleteError) {
            console.log(`⚠️  DELETE测试数据失败: ${deleteError.message}`);
          } else {
            console.log(`✅ DELETE测试数据成功`);
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ 测试${table}时发生错误: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('=== RLS验证完成 ===');
}

verifyRLS().catch(console.error);
