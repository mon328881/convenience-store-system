const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkTableStructure() {
  try {
    console.log('🔍 检查Supabase表结构...\n');

    // 检查 products 表结构
    console.log('📋 Products 表结构:');
    const { data: productsColumns, error: productsError } = await supabase
      .rpc('get_table_columns', { table_name: 'products' });

    if (productsError) {
      console.log('使用备用方法检查 products 表...');
      // 备用方法：尝试查询表来推断结构
      const { data: sampleProduct, error: sampleError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ 无法访问 products 表:', sampleError.message);
      } else {
        console.log('✅ Products 表可访问');
        if (sampleProduct && sampleProduct.length > 0) {
          console.log('字段:', Object.keys(sampleProduct[0]).join(', '));
          console.log('是否有 stock_alert 字段:', 'stock_alert' in sampleProduct[0] ? '✅ 是' : '❌ 否');
        } else {
          console.log('表为空，无法检查字段结构');
        }
      }
    }

    // 检查 outbound_records 表结构
    console.log('\n📋 Outbound_records 表结构:');
    const { data: outboundColumns, error: outboundError } = await supabase
      .rpc('get_table_columns', { table_name: 'outbound_records' });

    if (outboundError) {
      console.log('使用备用方法检查 outbound_records 表...');
      const { data: sampleOutbound, error: sampleError } = await supabase
        .from('outbound_records')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ 无法访问 outbound_records 表:', sampleError.message);
      } else {
        console.log('✅ Outbound_records 表可访问');
        if (sampleOutbound && sampleOutbound.length > 0) {
          console.log('字段:', Object.keys(sampleOutbound[0]).join(', '));
          console.log('是否有 status 字段:', 'status' in sampleOutbound[0] ? '✅ 是' : '❌ 否');
        } else {
          console.log('表为空，无法检查字段结构');
        }
      }
    }

    // 测试库存预警查询
    console.log('\n🧪 测试库存预警查询...');
    try {
      const { data: lowStockTest, error: lowStockError } = await supabase
        .from('products')
        .select('name, stock, stock_alert')
        .not('stock_alert', 'is', null)
        .filter('stock', 'lte', 'stock_alert')
        .limit(5);

      if (lowStockError) {
        console.error('❌ 库存预警查询失败:', lowStockError.message);
        console.log('💡 这表明 stock_alert 字段可能不存在，需要执行 add-missing-fields.sql');
      } else {
        console.log('✅ 库存预警查询成功');
        console.log('低库存商品数量:', lowStockTest ? lowStockTest.length : 0);
      }
    } catch (error) {
      console.error('❌ 库存预警查询异常:', error.message);
    }

    console.log('\n📊 数据库连接状态: ✅ 正常');

  } catch (error) {
    console.error('❌ 检查表结构失败:', error.message);
  }
}

checkTableStructure();