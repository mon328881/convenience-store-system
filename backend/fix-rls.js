const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg0MTYxOCwiZXhwIjoyMDY5NDE3NjE4fQ.6YP06hp4dKbPHXc_2-aAcQ_ACttb3EGa97VKXuFBsb4';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDE2MTgsImV4cCI6MjA2OTQxNzYxOH0.2URx1Ur6TxpayNiqDsKxae0wbETzqhxoq_59LoikkFw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLS() {
  try {
    console.log('🔧 修复suppliers表的RLS策略...');
    
    // 1. 禁用RLS
    console.log('1. 禁用RLS策略...');
    const disableRLSSQL = 'ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;';
    
    try {
      const { error: disableError } = await supabase.rpc('exec_sql', { sql: disableRLSSQL });
      if (disableError) {
        console.log('   RLS禁用失败，可能已经禁用:', disableError.message);
      } else {
        console.log('   ✅ RLS已禁用');
      }
    } catch (e) {
      console.log('   RLS禁用操作跳过');
    }
    
    // 2. 删除现有策略
    console.log('2. 清理现有策略...');
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Enable read access for all users" ON suppliers;',
      'DROP POLICY IF EXISTS "Enable insert for all users" ON suppliers;',
      'DROP POLICY IF EXISTS "Enable update for all users" ON suppliers;',
      'DROP POLICY IF EXISTS "Enable delete for all users" ON suppliers;'
    ];
    
    for (const sql of dropPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql });
      } catch (e) {
        // 忽略删除策略的错误
      }
    }
    
    // 3. 启用RLS
    console.log('3. 启用RLS策略...');
    const enableRLSSQL = 'ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;';
    
    try {
      const { error: enableError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL });
      if (enableError) {
        console.log('   RLS启用失败:', enableError.message);
      } else {
        console.log('   ✅ RLS已启用');
      }
    } catch (e) {
      console.log('   RLS启用操作跳过');
    }
    
    // 4. 创建允许所有操作的策略
    console.log('4. 创建访问策略...');
    const policies = [
      'CREATE POLICY "suppliers_select_policy" ON suppliers FOR SELECT USING (true);',
      'CREATE POLICY "suppliers_insert_policy" ON suppliers FOR INSERT WITH CHECK (true);',
      'CREATE POLICY "suppliers_update_policy" ON suppliers FOR UPDATE USING (true);',
      'CREATE POLICY "suppliers_delete_policy" ON suppliers FOR DELETE USING (true);'
    ];
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error && !error.message.includes('already exists')) {
          console.log('   策略创建失败:', error.message);
        } else {
          console.log('   ✅ 策略创建成功');
        }
      } catch (e) {
        console.log('   策略创建跳过:', e.message);
      }
    }
    
    // 5. 测试匿名访问
    console.log('5. 测试匿名用户访问...');
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await anonClient
      .from('suppliers')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('❌ 匿名访问失败:', error);
      console.log('请手动在Supabase控制台执行以下SQL:');
      console.log('ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log('✅ 匿名访问成功！数据条数:', data.length);
      if (data.length > 0) {
        console.log('   示例数据:', data[0].name);
      }
    }
    
  } catch (error) {
    console.error('操作失败:', error);
  }
}

fixRLS();