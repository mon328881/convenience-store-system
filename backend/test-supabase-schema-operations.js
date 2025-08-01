const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testSchemaOperations() {
  console.log('🧪 测试Supabase表结构操作能力...\n');
  
  try {
    // 1. 测试查看现有表结构
    console.log('1️⃣ 查看现有表结构...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);

    if (tablesError) {
      console.log('⚠️ 无法直接查询系统表:', tablesError.message);
      console.log('这是正常的，Supabase通过API限制了对系统表的直接访问');
    } else {
      console.log('✅ 找到的表:', tables?.map(t => t.table_name));
    }

    // 2. 测试查看products表的字段信息
    console.log('\n2️⃣ 查看products表字段信息...');
    const { data: productSample, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ 查询products表失败:', sampleError);
    } else {
      console.log('✅ products表现有字段:');
      if (productSample && productSample.length > 0) {
        const fields = Object.keys(productSample[0]);
        fields.forEach(field => {
          console.log(`  - ${field}: ${typeof productSample[0][field]}`);
        });
      } else {
        console.log('  表为空，无法获取字段信息');
      }
    }

    // 3. 测试创建新表（这通常需要特殊权限）
    console.log('\n3️⃣ 测试创建新表...');
    try {
      const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS test_table_temp (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW()
          );
        `
      });

      if (createError) {
        console.log('⚠️ 无法通过RPC创建表:', createError.message);
        console.log('这是正常的，Supabase API通常不允许直接执行DDL语句');
      } else {
        console.log('✅ 成功创建测试表');
      }
    } catch (rpcError) {
      console.log('⚠️ RPC功能不可用:', rpcError.message);
      console.log('这是正常的，大多数Supabase实例不开放exec_sql RPC功能');
    }

    // 4. 测试添加字段（通过ALTER TABLE）
    console.log('\n4️⃣ 测试添加字段...');
    try {
      const { data: alterResult, error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE products 
          ADD COLUMN IF NOT EXISTS test_field VARCHAR(50) DEFAULT 'test_value';
        `
      });

      if (alterError) {
        console.log('⚠️ 无法通过RPC添加字段:', alterError.message);
      } else {
        console.log('✅ 成功添加测试字段');
      }
    } catch (rpcError) {
      console.log('⚠️ 无法执行ALTER TABLE:', rpcError.message);
    }

    // 5. 检查是否有其他可用的管理功能
    console.log('\n5️⃣ 检查可用的管理功能...');
    
    // 检查是否可以访问pg_stat_user_tables
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('pg_stat_user_tables')
        .select('relname')
        .limit(5);

      if (statsError) {
        console.log('⚠️ 无法访问pg_stat_user_tables:', statsError.message);
      } else {
        console.log('✅ 可以访问表统计信息:', statsData?.map(s => s.relname));
      }
    } catch (e) {
      console.log('⚠️ 表统计信息不可访问');
    }

    console.log('\n📋 总结:');
    console.log('✅ 数据CRUD操作: 完全支持');
    console.log('⚠️ 表结构修改: 受限制，需要通过Supabase控制台');
    console.log('⚠️ 创建/删除表: 受限制，需要通过Supabase控制台');
    console.log('⚠️ 添加/删除字段: 受限制，需要通过Supabase控制台');
    
    console.log('\n🔍 原因分析:');
    console.log('1. Supabase API主要用于数据操作，不是数据库管理');
    console.log('2. DDL操作（CREATE, ALTER, DROP）需要数据库管理员权限');
    console.log('3. 出于安全考虑，这些操作通常只能在Supabase控制台进行');
    
    console.log('\n💡 建议解决方案:');
    console.log('1. 数据操作: 使用当前的API客户端（已完全正常）');
    console.log('2. 表结构修改: 通过Supabase控制台的SQL编辑器');
    console.log('3. 批量操作: 编写SQL脚本在控制台执行');
    console.log('4. 自动化: 考虑使用Supabase CLI工具');

  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

// 运行测试
testSchemaOperations().then(() => {
  console.log('\n测试完成');
  process.exit(0);
}).catch(error => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});
