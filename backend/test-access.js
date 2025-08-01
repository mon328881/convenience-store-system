const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg0MTYxOCwiZXhwIjoyMDY5NDE3NjE4fQ.6YP06hp4dKbPHXc_2-aAcQ_ACttb3EGa97VKXuFBsb4';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDE2MTgsImV4cCI6MjA2OTQxNzYxOH0.2URx1Ur6TxpayNiqDsKxae0wbETzqhxoq_59LoikkFw';

async function testTableAccess(client, tableName, keyType) {
  try {
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ ${keyType} - ${tableName} 访问失败:`, error.message);
      return false;
    } else {
      console.log(`✅ ${keyType} - ${tableName} 访问成功，数据条数: ${data.length}`);
      return true;
    }
  } catch (err) {
    console.log(`❌ ${keyType} - ${tableName} 访问异常:`, err.message);
    return false;
  }
}

async function testAccess() {
  try {
    console.log('🚀 开始测试所有表的访问权限...\n');
    
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const tables = ['suppliers', 'products', 'inbound_records', 'outbound_records'];
    
    console.log('=== 使用Service Key测试 ===');
    const serviceResults = {};
    for (const table of tables) {
      serviceResults[table] = await testTableAccess(serviceClient, table, 'Service Key');
    }
    
    console.log('\n=== 使用Anon Key测试 ===');
    const anonResults = {};
    for (const table of tables) {
      anonResults[table] = await testTableAccess(anonClient, table, 'Anon Key');
    }
    
    console.log('\n📊 测试结果汇总:');
    console.log('表名\t\t\tService Key\tAnon Key');
    console.log('─'.repeat(50));
    
    let allAnonPassed = true;
    for (const table of tables) {
      const serviceStatus = serviceResults[table] ? '✅' : '❌';
      const anonStatus = anonResults[table] ? '✅' : '❌';
      console.log(`${table.padEnd(20)}\t${serviceStatus}\t\t${anonStatus}`);
      
      if (!anonResults[table]) {
        allAnonPassed = false;
      }
    }
    
    console.log('\n' + '─'.repeat(50));
    if (allAnonPassed) {
      console.log('🎉 所有表的匿名访问权限配置正确！前端应该可以正常工作。');
    } else {
      console.log('⚠️  部分表的匿名访问权限需要修复');
      console.log('\n🔧 需要在Supabase控制台为失败的表配置RLS策略');
    }
    
  } catch (error) {
    console.error('操作失败:', error);
  }
}

testAccess();