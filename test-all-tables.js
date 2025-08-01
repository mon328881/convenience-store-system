require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTableAccess(tableName) {
  try {
    console.log(`\n🔍 测试 ${tableName} 表访问权限...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${tableName} 访问失败:`, error.message);
      return false;
    } else {
      console.log(`✅ ${tableName} 访问成功，数据条数: ${data.length}`);
      if (data.length > 0) {
        console.log(`   第一条数据ID: ${data[0].id}`);
      }
      return true;
    }
  } catch (err) {
    console.log(`❌ ${tableName} 访问异常:`, err.message);
    return false;
  }
}

async function testAllTables() {
  console.log('🚀 开始测试所有表的访问权限...');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 使用匿名密钥: ${supabaseAnonKey.substring(0, 20)}...`);

  const tables = ['suppliers', 'products', 'inbound_records', 'outbound_records'];
  const results = {};

  for (const table of tables) {
    results[table] = await testTableAccess(table);
  }

  console.log('\n📊 测试结果汇总:');
  let allPassed = true;
  for (const [table, passed] of Object.entries(results)) {
    console.log(`   ${passed ? '✅' : '❌'} ${table}: ${passed ? '通过' : '失败'}`);
    if (!passed) allPassed = false;
  }

  if (allPassed) {
    console.log('\n🎉 所有表访问权限配置正确！');
  } else {
    console.log('\n⚠️  部分表访问权限需要修复');
    console.log('\n🔧 修复建议:');
    console.log('1. 访问 Supabase SQL 编辑器');
    console.log('2. 为失败的表执行 RLS 策略配置');
    console.log('3. 确保为 anon 角色创建了正确的访问策略');
  }
}

testAllTables().catch(console.error);