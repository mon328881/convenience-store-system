require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFields() {
  try {
    console.log('验证products表字段...');
    
    // 尝试查询一条记录来获取字段信息
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('查询失败:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('products表当前字段:');
      const fields = Object.keys(data[0]);
      fields.forEach(field => {
        console.log(`- ${field}`);
      });
      
      // 检查关键字段
      const hasCreatedBy = fields.includes('created_by');
      const hasUpdatedBy = fields.includes('updated_by');
      
      console.log('\n字段检查结果:');
      console.log('created_by字段:', hasCreatedBy ? '✅ 存在' : '❌ 缺失');
      console.log('updated_by字段:', hasUpdatedBy ? '✅ 存在' : '❌ 缺失');
      
      if (hasCreatedBy && hasUpdatedBy) {
        console.log('\n✅ 所有必需字段都已添加成功！');
        console.log('现在可以测试商品保存功能了。');
      } else {
        console.log('\n❌ 仍有字段缺失，请在Supabase控制台执行以下SQL:');
        if (!hasCreatedBy) {
          console.log("ALTER TABLE products ADD COLUMN created_by VARCHAR(100) DEFAULT 'system';");
        }
        if (!hasUpdatedBy) {
          console.log("ALTER TABLE products ADD COLUMN updated_by VARCHAR(100) DEFAULT 'system';");
        }
      }
    } else {
      console.log('products表为空，无法检查字段结构');
      console.log('请先添加一些测试数据或在Supabase控制台查看表结构');
    }
    
  } catch (error) {
    console.error('验证失败:', error);
  }
}

verifyFields();