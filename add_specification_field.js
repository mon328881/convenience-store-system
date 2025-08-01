const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixqjqvqjqjqjqvqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxdnFqcWpxanF2cWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NjE4NzEsImV4cCI6MjA1MDUzNzg3MX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSpecificationField() {
  try {
    console.log('开始为products表添加specification字段...');
    
    // 执行SQL添加字段
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE products ADD COLUMN IF NOT EXISTS specification TEXT DEFAULT '';"
    });
    
    if (error) {
      console.log('RPC方式失败，尝试直接操作...');
      
      // 如果RPC不可用，我们可以尝试通过插入一条带有specification字段的测试数据来触发字段创建
      // 但这种方法不推荐，因为Supabase通常不允许动态添加字段
      
      console.log('请手动在Supabase控制台执行以下SQL:');
      console.log("ALTER TABLE products ADD COLUMN IF NOT EXISTS specification TEXT DEFAULT '';");
      
      return;
    }
    
    console.log('字段添加成功:', data);
    
    // 验证字段是否添加成功
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('specification')
      .limit(1);
    
    if (testError) {
      console.error('验证字段失败:', testError.message);
    } else {
      console.log('字段验证成功，specification字段已存在');
    }
    
  } catch (error) {
    console.error('添加字段失败:', error.message);
    console.log('\n请手动在Supabase控制台的SQL编辑器中执行以下SQL:');
    console.log("ALTER TABLE products ADD COLUMN IF NOT EXISTS specification TEXT DEFAULT '';");
  }
}

addSpecificationField();