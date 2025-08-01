const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg0MTYxOCwiZXhwIjoyMDY5NDE3NjE4fQ.6YP06hp4dKbPHXc_2-aAcQ_ACttb3EGa97VKXuFBsb4';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDE2MTgsImV4cCI6MjA2OTQxNzYxOH0.2URx1Ur6TxpayNiqDsKxae0wbETzqhxoq_59LoikkFw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function configureRLS() {
  console.log('🔧 配置便利店系统的RLS策略...\n');
  
  const tables = ['suppliers', 'products', 'inbound_records', 'outbound_records'];
  
  for (const table of tables) {
    console.log(`📋 配置 ${table} 表的RLS策略...`);
    
    try {
      // 1. 启用RLS
      console.log(`  1. 启用 ${table} 表的RLS...`);
      const enableRLSSQL = `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`;
      
      const { error: enableError } = await supabase.rpc('exec_sql', { 
        sql: enableRLSSQL 
      });
      
      if (enableError) {
        console.log(`     ⚠️ RLS启用失败: ${enableError.message}`);
      } else {
        console.log(`     ✅ ${table} 表RLS已启用`);
      }
      
      // 2. 删除现有策略（如果存在）
      console.log(`  2. 清理 ${table} 表的现有策略...`);
      const dropPolicies = [
        `DROP POLICY IF EXISTS "${table}_select_policy" ON ${table};`,
        `DROP POLICY IF EXISTS "${table}_insert_policy" ON ${table};`,
        `DROP POLICY IF EXISTS "${table}_update_policy" ON ${table};`,
        `DROP POLICY IF EXISTS "${table}_delete_policy" ON ${table};`,
        `DROP POLICY IF EXISTS "Allow all access" ON ${table};`
      ];
      
      for (const dropSQL of dropPolicies) {
        const { error } = await supabase.rpc('exec_sql', { sql: dropSQL });
        // 忽略删除不存在策略的错误
      }
      console.log(`     ✅ ${table} 表现有策略已清理`);
      
      // 3. 创建新的访问策略
      console.log(`  3. 创建 ${table} 表的访问策略...`);
      
      // 为匿名用户创建完全访问权限的策略
      const policies = [
        {
          name: `${table}_select_policy`,
          sql: `CREATE POLICY "${table}_select_policy" ON ${table} FOR SELECT TO anon USING (true);`,
          description: '允许匿名用户查询'
        },
        {
          name: `${table}_insert_policy`, 
          sql: `CREATE POLICY "${table}_insert_policy" ON ${table} FOR INSERT TO anon WITH CHECK (true);`,
          description: '允许匿名用户插入'
        },
        {
          name: `${table}_update_policy`,
          sql: `CREATE POLICY "${table}_update_policy" ON ${table} FOR UPDATE TO anon USING (true) WITH CHECK (true);`,
          description: '允许匿名用户更新'
        },
        {
          name: `${table}_delete_policy`,
          sql: `CREATE POLICY "${table}_delete_policy" ON ${table} FOR DELETE TO anon USING (true);`,
          description: '允许匿名用户删除'
        }
      ];
      
      for (const policy of policies) {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
        if (error) {
          console.log(`     ❌ ${policy.description}策略创建失败: ${error.message}`);
        } else {
          console.log(`     ✅ ${policy.description}策略创建成功`);
        }
      }
      
      console.log(`  ✅ ${table} 表RLS配置完成\n`);
      
    } catch (error) {
      console.error(`❌ ${table} 表RLS配置失败:`, error.message);
    }
  }
  
  // 4. 测试匿名访问
  console.log('🧪 测试匿名用户访问...');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  
  for (const table of tables) {
    try {
      const { data, error } = await anonClient.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table} 表匿名访问失败: ${error.message}`);
      } else {
        console.log(`✅ ${table} 表匿名访问成功，数据条数: ${data.length}`);
      }
    } catch (error) {
      console.log(`❌ ${table} 表匿名访问测试失败: ${error.message}`);
    }
  }
  
  console.log('\n🎉 RLS策略配置完成！');
  console.log('\n📋 配置总结:');
  console.log('- 所有表都启用了RLS');
  console.log('- 为匿名用户(anon)创建了完全访问权限');
  console.log('- 支持SELECT、INSERT、UPDATE、DELETE操作');
  console.log('- 前端可以使用匿名密钥正常访问数据');
}

// 手动SQL配置方案
function printManualSQLInstructions() {
  console.log('\n🔧 如果自动配置失败，请在Supabase控制台手动执行以下SQL:');
  console.log('访问: https://supabase.com/dashboard/project/nxogjfzasogjzbkpfwle/sql\n');
  
  const tables = ['suppliers', 'products', 'inbound_records', 'outbound_records'];
  
  tables.forEach(table => {
    console.log(`-- 配置 ${table} 表`);
    console.log(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    console.log(`DROP POLICY IF EXISTS "${table}_select_policy" ON ${table};`);
    console.log(`DROP POLICY IF EXISTS "${table}_insert_policy" ON ${table};`);
    console.log(`DROP POLICY IF EXISTS "${table}_update_policy" ON ${table};`);
    console.log(`DROP POLICY IF EXISTS "${table}_delete_policy" ON ${table};`);
    console.log(`CREATE POLICY "${table}_select_policy" ON ${table} FOR SELECT TO anon USING (true);`);
    console.log(`CREATE POLICY "${table}_insert_policy" ON ${table} FOR INSERT TO anon WITH CHECK (true);`);
    console.log(`CREATE POLICY "${table}_update_policy" ON ${table} FOR UPDATE TO anon USING (true) WITH CHECK (true);`);
    console.log(`CREATE POLICY "${table}_delete_policy" ON ${table} FOR DELETE TO anon USING (true);`);
    console.log('');
  });
}

// 执行配置
configureRLS().catch(error => {
  console.error('❌ RLS配置过程中出现错误:', error);
  printManualSQLInstructions();
});