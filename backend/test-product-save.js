const { createClient } = require('@supabase/supabase-js');
const SupabaseProduct = require('./src/models/SupabaseProduct');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testProductSave() {
  console.log('🧪 测试商品保存功能...\n');
  
  const testProduct = {
    name: '测试商品-' + Date.now(),
    price: 99.99,
    stock: 100,
    category: '测试分类',
    brand: '测试品牌',
    supplier_id: 1,
    status: 'active',
    stock_alert: 10,
    created_by: 'test_user',
    updated_by: 'test_user'
  };

  let createdProductId = null;

  try {
    console.log('📝 测试数据:', JSON.stringify(testProduct, null, 2));
    
    // 1. 测试直接使用Supabase客户端保存
    console.log('\n1️⃣ 测试直接使用Supabase客户端保存...');
    const { data: directData, error: directError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (directError) {
      console.error('❌ 直接保存失败:', directError);
      throw directError;
    }
    
    console.log('✅ 直接保存成功! ID:', directData.id);
    createdProductId = directData.id;

    // 2. 测试使用SupabaseProduct模型保存
    console.log('\n2️⃣ 测试使用SupabaseProduct模型保存...');
    const testProduct2 = {
      ...testProduct,
      name: '测试商品2-' + Date.now()
    };
    
    const modelData = await SupabaseProduct.create(testProduct2);
    console.log('✅ 模型保存成功! ID:', modelData.id);

    // 3. 测试更新功能
    console.log('\n3️⃣ 测试更新功能...');
    const updateData = {
      name: '更新后的商品名称-' + Date.now(),
      price: 199.99,
      updated_by: 'test_user_updated'
    };
    
    const updatedData = await SupabaseProduct.findByIdAndUpdate(modelData.id, updateData);
    console.log('✅ 更新成功! 新名称:', updatedData.name);

    // 4. 清理测试数据
    console.log('\n🧹 清理测试数据...');
    
    // 删除第一个测试商品
    if (createdProductId) {
      const { error: deleteError1 } = await supabase
        .from('products')
        .delete()
        .eq('id', createdProductId);
      
      if (deleteError1) {
        console.error('⚠️ 删除第一个测试商品失败:', deleteError1);
      } else {
        console.log('✅ 删除第一个测试商品成功');
      }
    }
    
    // 删除第二个测试商品
    const deletedData = await SupabaseProduct.findByIdAndDelete(modelData.id);
    console.log('✅ 删除第二个测试商品成功');

    console.log('\n🎉 所有测试通过! Supabase本地更新功能正常工作');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    
    // 错误分析
    if (error.code === 'PGRST301') {
      console.log('\n🔍 错误分析: 这是RLS (Row Level Security) 权限问题');
      console.log('解决方案:');
      console.log('1. 在Supabase控制台中禁用products表的RLS');
      console.log('2. 或者添加允许所有操作的RLS策略');
      console.log('3. 或者使用service_role密钥而不是anon密钥');
    } else if (error.message.includes('createdBy')) {
      console.log('\n🔍 错误分析: 字段名称不匹配问题');
      console.log('数据库使用下划线命名 (created_by)，代码使用驼峰命名 (createdBy)');
    }
    
    // 尝试清理可能创建的数据
    if (createdProductId) {
      try {
        await supabase.from('products').delete().eq('id', createdProductId);
        console.log('✅ 清理了部分测试数据');
      } catch (cleanupError) {
        console.log('⚠️ 清理测试数据时出错:', cleanupError.message);
      }
    }
  }
}

// 运行测试
testProductSave().then(() => {
  console.log('\n测试完成');
  process.exit(0);
}).catch(error => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});
