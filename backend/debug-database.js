const { supabase } = require('./src/config/supabase');

async function debugDatabase() {
  console.log('🔍 开始数据库诊断...\n');

  try {
    // 1. 测试基本连接
    console.log('1. 测试数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count', { count: 'exact' });
    
    if (testError) {
      console.error('❌ 数据库连接失败:', testError.message);
      return;
    }
    console.log('✅ 数据库连接成功');

    // 2. 检查表结构
    console.log('\n2. 检查表结构...');
    const tables = ['products', 'suppliers', 'inbound_records', 'outbound_records'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ 表 ${table}: ${error.message}`);
        } else {
          console.log(`✅ 表 ${table}: ${count} 条记录`);
        }
      } catch (err) {
        console.log(`❌ 表 ${table}: ${err.message}`);
      }
    }

    // 3. 检查商品数据
    console.log('\n3. 检查商品数据...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('❌ 查询商品失败:', productsError.message);
    } else {
      console.log(`✅ 商品数据: ${products.length} 条记录`);
      if (products.length > 0) {
        console.log('示例商品:', products[0]);
      }
    }

    // 4. 检查供应商数据
    console.log('\n4. 检查供应商数据...');
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(5);
    
    if (suppliersError) {
      console.error('❌ 查询供应商失败:', suppliersError.message);
    } else {
      console.log(`✅ 供应商数据: ${suppliers.length} 条记录`);
      if (suppliers.length > 0) {
        console.log('示例供应商:', suppliers[0]);
      }
    }

    // 5. 检查入库记录
    console.log('\n5. 检查入库记录...');
    const { data: inbound, error: inboundError } = await supabase
      .from('inbound_records')
      .select('*')
      .limit(5);
    
    if (inboundError) {
      console.error('❌ 查询入库记录失败:', inboundError.message);
    } else {
      console.log(`✅ 入库记录: ${inbound.length} 条记录`);
      if (inbound.length > 0) {
        console.log('示例入库记录:', inbound[0]);
      }
    }

    // 6. 检查出库记录
    console.log('\n6. 检查出库记录...');
    const { data: outbound, error: outboundError } = await supabase
      .from('outbound_records')
      .select('*')
      .limit(5);
    
    if (outboundError) {
      console.error('❌ 查询出库记录失败:', outboundError.message);
    } else {
      console.log(`✅ 出库记录: ${outbound.length} 条记录`);
      if (outbound.length > 0) {
        console.log('示例出库记录:', outbound[0]);
      }
    }

    console.log('\n🎉 数据库诊断完成!');

  } catch (error) {
    console.error('💥 诊断过程中发生错误:', error.message);
  }
}

debugDatabase();