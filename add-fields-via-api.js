const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://nxogjfzasogjzbkpfwle.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b2dqZnphc29nanpia3Bmd2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg0MTYxOCwiZXhwIjoyMDY5NDE3NjE4fQ.6YP06hp4dKbPHXc_2-aAcQ_ACttb3EGa97VKXuFBsb4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addSystemFields() {
  try {
    console.log('开始为 inbound_records 表添加系统字段...');
    
    // 使用 RPC 调用执行 SQL
    const sqlCommands = [
      `ALTER TABLE inbound_records ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) DEFAULT 'system';`,
      `ALTER TABLE inbound_records ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255) DEFAULT 'system';`,
      `ALTER TABLE inbound_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`
    ];
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`执行SQL ${i + 1}:`, sql);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`SQL ${i + 1} 执行失败:`, error);
      } else {
        console.log(`✅ SQL ${i + 1} 执行成功`);
      }
    }
    
    // 创建触发器函数
    console.log('创建触发器函数...');
    const triggerFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    
    const { data: funcData, error: funcError } = await supabase.rpc('exec_sql', { sql: triggerFunction });
    
    if (funcError) {
      console.error('创建触发器函数失败:', funcError);
    } else {
      console.log('✅ 触发器函数创建成功');
    }
    
    // 创建触发器
    console.log('创建触发器...');
    const triggerSql = `
      DROP TRIGGER IF EXISTS update_inbound_records_updated_at ON inbound_records;
      CREATE TRIGGER update_inbound_records_updated_at
          BEFORE UPDATE ON inbound_records
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;
    
    const { data: triggerData, error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSql });
    
    if (triggerError) {
      console.error('创建触发器失败:', triggerError);
    } else {
      console.log('✅ 触发器创建成功');
    }
    
    // 验证字段是否添加成功
    console.log('验证字段添加结果...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default, is_nullable')
      .eq('table_name', 'inbound_records')
      .in('column_name', ['created_by', 'updated_by', 'updated_at']);
    
    if (columnError) {
      console.error('验证字段失败:', columnError);
    } else {
      console.log('✅ 字段验证结果:');
      console.table(columns);
    }
    
    console.log('🎉 系统字段添加完成！');
    
  } catch (error) {
    console.error('添加字段过程中出错:', error);
  }
}

// 执行函数
addSystemFields();