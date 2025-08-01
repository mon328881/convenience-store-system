const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// 从根目录加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('SUPABASE_SERVICE_KEY:', supabaseKey ? 'Set' : 'Missing');
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试连接
async function testConnection() {
    try {
        const { data, error } = await supabase.from('suppliers').select('count', { count: 'exact' });
        if (error) {
            console.log('Supabase connection test - tables not ready yet:', error.message);
        } else {
            console.log('✅ Supabase connection successful');
        }
    } catch (err) {
        console.log('Supabase connection test error:', err.message);
    }
}

// 启动时测试连接
testConnection();

module.exports = { supabase };