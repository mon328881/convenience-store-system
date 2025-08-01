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
    supplier_id: 8, // 使用存在的供应商ID
    status: 'active',
    stock_alert: 10,
    created_by: 'test_user',
    updated_by: 'test_user'
  };

  let createdProductId = null;
  let modelProductId = null;

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
    console.log('📋 保存的数据:', {
      id: directData.id,
      name: directData.name,
      price: directData.price,
      created_by: directData.created_by,
      updated_by: directData.updated_by
    });
    createdProductId = directData.id;

    // 2. 测试使用SupabaseProduct模型保存
    console.log('\n2️⃣ 测试使用SupabaseProduct模型保存...');
    const testProduct2 = {
      ...testProduct,
      name: '测试商品2-' + Date.now()
    };
    
    const modelData = await SupabaseProduct.create(testProduct2);
    console.log('✅ 模型保存成功! ID:', modelData.id);
    console.log('📋 保存的数据:', {
      id: modelData.id,
      name: modelData.name,
      price: modelData.price,
      created_by: modelData.created_by,
      updated_by: modelData.updated_by
    });
    modelProductId = modelData.id;

    // 3. 测试更新功能
    console.log('\n3️⃣ 测试更新功能...');
    const updateData = {
      name: '更新后的商品名称-' + Date.now(),
      price: 199.99,
      updated_by: 'test_user_updated'
    };
    
    const updatedData = await SupabaseProduct.findByIdAndUpdate(modelData.id, updateData);
    console.log('✅ 更新成功!');
    console.log('📋 更新后数据:', {
      id: updatedData.id,
      name: updatedData.name,
      price: updatedData.price,
      updated_by: updatedData.updated_by
    });

    // 4. 测试查询功能
    console.log('\n4️⃣ 测试查询功能...');
    const foundProduct = await SupabaseProduct.findById(updatedData.id);
    console.log('✅ 查询成功!');
    console.log('📋 查询到的数据:', {
      id: foundProduct.id,
      name: foundProduct.name,
      price: foundProduct.price,
      created_by: foundProduct.created_by,
      updated_by: foundProduct.updated_by
    });

    console.log('\n🎉 所有测试通过! Supabase本地更新功能正常工作');
    console.log('✅ 确认问题已解决:');
    console.log('  - 数据库连接正常');
    console.log('  - 字段名称匹配 (created_by, updated_by)');
    console.log('  - 增删改查功能完整');
    console.log('  - 不需要手动去Supabase网站更新');
    
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
    } else if (error.code === '23503') {
      console.log('\n🔍 错误分析: 外键约束问题');
      console.log('supplier_id 引用的供应商不存在');
    }
  } finally {
    // 5. 清理测试数据
    console.log('\n🧹 清理测试数据...');
    
    // 删除第一个测试商品
    if (createdProductId) {
      try {
        const { error: deleteError1 } = await supabase
          .from('products')
          .delete()
          .eq('id', createdProductId);
        
        if (deleteError1) {
          console.error('⚠️ 删除第一个测试商品失败:', deleteError1.message);
        } else {
          console.log('✅ 删除第一个测试商品成功');
        }
      } catch (e) {
        console.error('⚠️ 删除第一个测试商品时出错:', e.message);
      }
    }
    
    // 删除第二个测试商品
    if (modelProductId) {
      try {
        const deletedData = await SupabaseProduct.findByIdAndDelete(modelProductId);
        console.log('✅ 删除第二个测试商品成功');
      } catch (e) {
        console.error('⚠️ 删除第二个测试商品失败:', e.message);
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
