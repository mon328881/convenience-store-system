const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取配置
const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg0MTYxOCwiZXhwIjoyMDY5NDE3NjE4fQ.6YP06hp4dKbPHXc_2-aAcQ_ACttb3EGa97VKXuFBsb4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingFields() {
  try {
    console.log('开始检查和添加缺失的字段...');
    
    // 先获取一个真实的商品ID和供应商ID
    console.log('获取真实的商品和供应商ID...');
    
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
      
    const { data: suppliers, error: supplierError } = await supabase
      .from('suppliers')
      .select('id')
      .limit(1);
    
    if (productError || supplierError || !products?.length || !suppliers?.length) {
      console.log('无法获取真实的商品或供应商ID，使用UUID测试...');
      
      // 使用随机UUID测试，主要是为了检查字段是否存在
      const testData = {
        product_id: '00000000-0000-0000-0000-000000000001',
        supplier_id: '00000000-0000-0000-0000-000000000001',
        quantity: 1,
        unit_price: 10.0,
        total_amount: 10.0,
        date: new Date().toISOString().split('T')[0],
        notes: '测试记录',
        created_by: 'system',
        updated_by: 'system'
      };
      
      const { data, error } = await supabase
        .from('inbound_records')
        .insert([testData])
        .select();
      
      if (error) {
        console.error('创建测试记录失败:', error);
        
        if (error.message.includes('created_by') || error.message.includes('updated_by')) {
          console.log('❌ 确认缺少 created_by 或 updated_by 字段');
        } else if (error.code === '23503') {
          console.log('✅ 外键约束错误，说明字段结构正常，只是引用的ID不存在');
        } else {
          console.log('其他错误:', error.message);
        }
      } else {
        console.log('✅ 测试记录创建成功，字段完整');
        
        // 删除测试记录
        if (data && data[0]) {
          await supabase
            .from('inbound_records')
            .delete()
            .eq('id', data[0].id);
          console.log('已删除测试记录');
        }
      }
    } else {
      console.log('使用真实ID测试...');
      
      const testData = {
        product_id: products[0].id,
        supplier_id: suppliers[0].id,
        quantity: 1,
        unit_price: 10.0,
        total_amount: 10.0,
        date: new Date().toISOString().split('T')[0],
        notes: '测试记录',
        created_by: 'system',
        updated_by: 'system'
      };
      
      const { data, error } = await supabase
        .from('inbound_records')
        .insert([testData])
        .select();
      
      if (error) {
        console.error('创建测试记录失败:', error);
        
        if (error.message.includes('created_by') || error.message.includes('updated_by')) {
          console.log('❌ 确认缺少 created_by 或 updated_by 字段');
        } else {
          console.log('其他错误:', error.message);
        }
      } else {
        console.log('✅ 测试记录创建成功，字段完整');
        
        // 删除测试记录
        if (data && data[0]) {
          await supabase
            .from('inbound_records')
            .delete()
            .eq('id', data[0].id);
          console.log('已删除测试记录');
        }
      }
    }
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  }
}

// 运行脚本
addMissingFields();