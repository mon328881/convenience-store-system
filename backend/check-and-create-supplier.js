const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkAndCreateSupplier() {
  console.log('🔍 检查suppliers表...\n');
  
  try {
    // 1. 检查suppliers表是否存在数据
    const { data: suppliers, error: selectError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(5);

    if (selectError) {
      console.error('❌ 查询suppliers表失败:', selectError);
      return;
    }

    console.log('📊 当前suppliers表数据:');
    if (suppliers && suppliers.length > 0) {
      console.log(`✅ 找到 ${suppliers.length} 个供应商:`);
      suppliers.forEach(supplier => {
        console.log(`  - ID: ${supplier.id}, 名称: ${supplier.name || supplier.supplier_name || '未知'}`);
      });
    } else {
      console.log('⚠️ suppliers表为空，创建测试供应商...');
      
      // 2. 创建测试供应商
      const testSupplier = {
        name: '测试供应商',
        contact_person: '张三',
        phone: '13800138000',
        email: 'test@supplier.com',
        address: '测试地址',
        status: 'active',
        created_by: 'system',
        updated_by: 'system'
      };

      const { data: newSupplier, error: insertError } = await supabase
        .from('suppliers')
        .insert(testSupplier)
        .select()
        .single();

      if (insertError) {
        console.error('❌ 创建测试供应商失败:', insertError);
        
        // 尝试使用不同的字段名
        console.log('🔄 尝试使用不同的字段名...');
        const altSupplier = {
          supplier_name: '测试供应商',
          contact_person: '张三',
          phone: '13800138000',
          email: 'test@supplier.com',
          address: '测试地址',
          status: 'active'
        };

        const { data: altNewSupplier, error: altInsertError } = await supabase
          .from('suppliers')
          .insert(altSupplier)
          .select()
          .single();

        if (altInsertError) {
          console.error('❌ 使用备用字段名创建供应商也失败:', altInsertError);
        } else {
          console.log('✅ 使用备用字段名创建测试供应商成功! ID:', altNewSupplier.id);
        }
      } else {
        console.log('✅ 创建测试供应商成功! ID:', newSupplier.id);
      }
    }

    // 3. 再次查询确认
    const { data: finalSuppliers, error: finalError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(5);

    if (finalError) {
      console.error('❌ 最终查询失败:', finalError);
    } else {
      console.log('\n📋 最终suppliers表状态:');
      if (finalSuppliers && finalSuppliers.length > 0) {
        finalSuppliers.forEach(supplier => {
          console.log(`  - ID: ${supplier.id}, 名称: ${supplier.name || supplier.supplier_name || '未知'}`);
        });
      } else {
        console.log('⚠️ suppliers表仍然为空');
      }
    }

  } catch (error) {
    console.error('❌ 检查suppliers表时出错:', error.message);
  }
}

// 运行检查
checkAndCreateSupplier().then(() => {
  console.log('\n检查完成');
  process.exit(0);
}).catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
