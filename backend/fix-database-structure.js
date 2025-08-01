const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置信息');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseStructure() {
  console.log('🔧 开始修复数据库结构...');
  
  try {
    // 1. 移除供应商表中的 products 字段
    console.log('1. 移除suppliers表的products字段...');
    const { error: dropColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE suppliers DROP COLUMN IF EXISTS products;'
    });
    
    if (dropColumnError) {
      console.log('⚠️  无法使用exec_sql函数，尝试直接操作...');
      // 如果没有exec_sql函数，我们需要通过其他方式处理
    } else {
      console.log('✅ 成功移除suppliers表的products字段');
    }
    
    // 2. 确保products表有supplier_id字段
    console.log('2. 检查products表的supplier_id字段...');
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      throw productsError;
    }
    
    if (productsData && productsData.length > 0) {
      const hasSupplierIdField = productsData[0].hasOwnProperty('supplier_id');
      console.log(`products表supplier_id字段: ${hasSupplierIdField ? '✅ 存在' : '❌ 不存在'}`);
      
      if (hasSupplierIdField) {
        console.log('✅ products表已包含supplier_id字段，结构正确');
      } else {
        console.log('❌ products表缺少supplier_id字段，需要手动添加');
        console.log('请在Supabase控制台执行以下SQL:');
        console.log('ALTER TABLE products ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id);');
      }
    }
    
    // 3. 检查当前数据结构
    console.log('\n3. 检查当前数据结构...');
    
    // 检查suppliers表结构
    const { data: suppliersData, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1);
    
    if (suppliersError) {
      throw suppliersError;
    }
    
    if (suppliersData && suppliersData.length > 0) {
      console.log('\n📋 suppliers表字段:');
      Object.keys(suppliersData[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof suppliersData[0][key]}`);
      });
    }
    
    // 检查products表结构
    if (productsData && productsData.length > 0) {
      console.log('\n📋 products表字段:');
      Object.keys(productsData[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof productsData[0][key]}`);
      });
    }
    
    console.log('\n✅ 数据库结构检查完成');
    
  } catch (error) {
    console.error('❌ 修复数据库结构失败:', error.message);
    process.exit(1);
  }
}

fixDatabaseStructure();