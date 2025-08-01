const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 检查Supabase连接和权限...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseKey ? '已设置' : '未设置');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 测试基本连接
    console.log('\n1. 测试基本连接...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.log('❌ 连接失败:', testError.message);
      console.log('错误详情:', testError);
      return;
    }
    console.log('✅ 连接成功');

    // 测试插入权限
    console.log('\n2. 测试插入权限...');
    const testProduct = {
      name: '测试商品_' + Date.now(),
      price: 1.00,
      stock: 1,
      category: '测试',
      brand: '测试品牌',
      status: 'active',
      created_by: 'system',
      updated_by: 'system'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();
    
    if (insertError) {
      console.log('❌ 插入失败:', insertError.message);
      console.log('错误代码:', insertError.code);
      console.log('错误详情:', insertError.details);
      console.log('错误提示:', insertError.hint);
      
      // 检查是否是RLS权限问题
      if (insertError.code === '42501' || insertError.message.includes('RLS') || insertError.message.includes('policy')) {
        console.log('\n🔒 这是RLS（行级安全）权限问题！');
        console.log('需要在Supabase控制台禁用RLS或添加策略');
      }
    } else {
      console.log('✅ 插入成功');
      
      // 清理测试数据
      if (insertData && insertData[0]) {
        await supabase.from('products').delete().eq('id', insertData[0].id);
        console.log('✅ 测试数据已清理');
      }
    }

    // 测试更新权限
    console.log('\n3. 测试更新权限...');
    const { data: firstProduct, error: selectError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (selectError || !firstProduct || firstProduct.length === 0) {
      console.log('❌ 无法获取测试产品');
      return;
    }
    
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ updated_by: 'test_system' })
      .eq('id', firstProduct[0].id)
      .select();
    
    if (updateError) {
      console.log('❌ 更新失败:', updateError.message);
      console.log('错误代码:', updateError.code);
      console.log('错误详情:', updateError.details);
      
      // 检查是否是RLS权限问题
      if (updateError.code === '42501' || updateError.message.includes('RLS') || updateError.message.includes('policy')) {
        console.log('\n🔒 这是RLS（行级安全）权限问题！');
        console.log('需要在Supabase控制台禁用RLS或添加策略');
      }
    } else {
      console.log('✅ 更新成功');
    }

    // 检查RLS状态
    console.log('\n4. 检查RLS状态...');
    const { data: rlsData, error: rlsError } = await supabase.rpc('check_rls_status');
    
    if (rlsError) {
      console.log('⚠️ 无法检查RLS状态（这是正常的）');
    } else {
      console.log('RLS状态:', rlsData);
    }

  } catch (error) {
    console.log('❌ 测试过程中出现异常:', error.message);
    console.log('异常详情:', error);
  }
}

async function checkRLSAndPolicies() {
  console.log('\n🔍 检查表的RLS设置...');
  
  try {
    // 尝试查询系统表来检查RLS状态
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity as rls_enabled,
          hasrls
        FROM pg_tables 
        LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
        WHERE schemaname = 'public' 
        AND tablename IN ('products', 'suppliers', 'inbound_records', 'outbound_records');
      `
    });
    
    if (error) {
      console.log('⚠️ 无法直接查询RLS状态');
    } else {
      console.log('表RLS状态:', data);
    }
  } catch (err) {
    console.log('⚠️ RLS检查失败，这可能是权限限制');
  }
}

console.log('开始测试...');
testConnection().then(() => {
  return checkRLSAndPolicies();
}).then(() => {
  console.log('\n📋 解决方案:');
  console.log('1. 登录Supabase控制台');
  console.log('2. 进入Authentication → Policies');
  console.log('3. 对于products表，选择"Disable RLS"或添加允许所有操作的策略');
  console.log('4. 对其他表重复此操作');
  console.log('\n或者在SQL Editor中执行:');
  console.log('ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE inbound_records DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE outbound_records DISABLE ROW LEVEL SECURITY;');
});