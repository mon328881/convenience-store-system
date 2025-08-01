const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg0MTYxOCwiZXhwIjoyMDY5NDE3NjE4fQ.6YP06hp4dKbPHXc_2-aAcQ_ACttb3EGa97VKXuFBsb4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInboundFields() {
  try {
    console.log('检查 inbound_records 表结构...');
    
    // 直接测试字段结构，不依赖现有数据
    console.log('\n测试1: 尝试插入包含系统字段的记录（使用虚拟ID）...');
    const testData1 = {
      product_id: '00000000-0000-0000-0000-000000000001',
      supplier_id: '00000000-0000-0000-0000-000000000001',
      quantity: 1,
      unit_price: 10.0,
      total_amount: 10.0,
      date: new Date().toISOString().split('T')[0],
      notes: '测试记录 - 包含系统字段',
      created_by: 'test_user',
      updated_by: 'test_user'
    };
    
    const { data: result1, error: error1 } = await supabase
      .from('inbound_records')
      .insert([testData1])
      .select();
    
    if (error1) {
      console.log('插入失败，错误信息:', error1.message);
      console.log('错误代码:', error1.code);
      
      if (error1.code === '23503') {
        console.log('✅ 外键约束错误，说明字段结构正常，只是引用的ID不存在');
        console.log('🎉 确认：表中已包含系统字段 created_by 和 updated_by！');
      } else if (error1.message.includes('created_by') || error1.message.includes('updated_by')) {
        console.log('❌ 确认缺少系统字段');
      } else {
        console.log('⚠️  其他错误，需要进一步检查');
      }
    } else {
      console.log('✅ 包含系统字段的插入成功！');
      console.log('📋 插入的记录:', result1[0]);
      
      // 清理测试记录
      await supabase
        .from('inbound_records')
        .delete()
        .eq('id', result1[0].id);
      console.log('🧹 已清理测试记录');
    }
    
    // 测试2: 查询现有记录的字段结构
    console.log('\n测试2: 查询现有记录的字段结构...');
    const { data: existingRecords, error: queryError } = await supabase
      .from('inbound_records')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.log('❌ 查询现有记录失败:', queryError.message);
    } else if (existingRecords?.length > 0) {
      console.log('✅ 查询到现有记录');
      console.log('📋 记录字段:', Object.keys(existingRecords[0]));
      
      const hasSystemFields = ['created_by', 'updated_by', 'updated_at'].every(
        field => existingRecords[0].hasOwnProperty(field)
      );
      
      if (hasSystemFields) {
        console.log('🎉 确认：表中已包含所有系统字段！');
      } else {
        console.log('⚠️  表中缺少部分系统字段');
        console.log('缺少的字段:', ['created_by', 'updated_by', 'updated_at'].filter(
          field => !existingRecords[0].hasOwnProperty(field)
        ));
      }
    } else {
      console.log('ℹ️  表中暂无数据记录');
    }
    
    // 测试3: 尝试查询系统字段
    console.log('\n测试3: 尝试查询系统字段...');
    const { data: fieldTest, error: fieldError } = await supabase
      .from('inbound_records')
      .select('id, created_by, updated_by, updated_at')
      .limit(1);
    
    if (fieldError) {
      console.log('❌ 查询系统字段失败:', fieldError.message);
      if (fieldError.message.includes('created_by') || fieldError.message.includes('updated_by')) {
        console.log('❌ 确认：表中缺少系统字段');
      }
    } else {
      console.log('✅ 系统字段查询成功');
      console.log('🎉 确认：表中已包含所有系统字段！');
    }
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 执行测试
testInboundFields();