const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg0MTYxOCwiZXhwIjoyMDY5NDE3NjE4fQ.6YP06hp4dKbPHXc_2-aAcQ_ACttb3EGa97VKXuFBsb4';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDE2MTgsImV4cCI6MjA2OTQxNzYxOH0.2URx1Ur6TxpayNiqDsKxae0wbETzqhxoq_59LoikkFw';

async function disableRLS() {
  try {
    console.log('🔧 尝试禁用suppliers表的RLS策略...');
    
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // 方法1: 尝试使用SQL查询禁用RLS
    console.log('1. 尝试通过SQL禁用RLS...');
    
    try {
      // 使用原生SQL查询
      const { data, error } = await serviceClient
        .from('suppliers')
        .select('*')
        .limit(1);
        
      if (!error) {
        console.log('✅ 数据库连接正常');
        
        // 尝试通过PostgREST API执行SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            sql: 'ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;'
          })
        });
        
        if (response.ok) {
          console.log('✅ RLS已通过API禁用');
        } else {
          console.log('❌ API禁用失败，状态码:', response.status);
        }
      }
    } catch (e) {
      console.log('❌ SQL方法失败:', e.message);
    }
    
    // 方法2: 创建允许所有访问的策略
    console.log('2. 创建允许所有访问的策略...');
    
    try {
      // 删除现有策略
      const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: 'DROP POLICY IF EXISTS "Allow all access" ON suppliers;'
        })
      });
      
      // 创建新策略
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: `CREATE POLICY "Allow all access" ON suppliers FOR ALL USING (true) WITH CHECK (true);`
        })
      });
      
      if (createResponse.ok) {
        console.log('✅ 访问策略已创建');
      } else {
        console.log('❌ 策略创建失败');
      }
    } catch (e) {
      console.log('❌ 策略方法失败:', e.message);
    }
    
    // 测试匿名访问
    console.log('3. 测试匿名访问...');
    
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: anonData, error: anonError } = await anonClient
      .from('suppliers')
      .select('*');
    
    if (anonError) {
      console.error('❌ 匿名访问仍然失败:', anonError.message);
      
      // 输出手动解决方案
      console.log('\n📋 请手动在Supabase控制台执行以下SQL:');
      console.log('1. 进入 https://supabase.com/dashboard/project/nxogjfzasogjzbkpfwle/sql');
      console.log('2. 执行以下SQL命令:');
      console.log('   ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;');
      console.log('   或者');
      console.log('   DROP POLICY IF EXISTS "Allow all access" ON suppliers;');
      console.log('   CREATE POLICY "Allow all access" ON suppliers FOR ALL USING (true) WITH CHECK (true);');
      
    } else {
      console.log('✅ 匿名访问成功！数据条数:', anonData.length);
      if (anonData.length > 0) {
        console.log('第一条数据:', anonData[0].name);
      }
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  }
}

disableRLS();