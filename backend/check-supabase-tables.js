#!/usr/bin/env node

/**
 * 检查Supabase表结构
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// 从根目录加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
    try {
        console.log('🔍 检查Supabase表结构...\n');
        
        // 检查products表
        console.log('📦 Products表结构:');
        try {
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*')
                .limit(1);
            
            if (productsError) {
                console.log('Products表错误:', JSON.stringify(productsError, null, 2));
            } else {
                console.log('Products表字段:', products.length > 0 ? Object.keys(products[0]) : '表为空');
            }
        } catch (error) {
            console.log('Products表检查失败:', JSON.stringify(error, null, 2));
        }

        // 检查suppliers表
        console.log('\n🏢 Suppliers表结构:');
        try {
            const { data: suppliers, error: suppliersError } = await supabase
                .from('suppliers')
                .select('*')
                .limit(1);
            
            if (suppliersError) {
                console.log('Suppliers表错误:', JSON.stringify(suppliersError, null, 2));
            } else {
                console.log('Suppliers表字段:', suppliers.length > 0 ? Object.keys(suppliers[0]) : '表为空');
            }
        } catch (error) {
            console.log('Suppliers表检查失败:', JSON.stringify(error, null, 2));
        }

        // 检查inbound_records表
        console.log('\n📥 Inbound_records表结构:');
        try {
            const { data: inbound, error: inboundError } = await supabase
                .from('inbound_records')
                .select('*')
                .limit(1);
            
            if (inboundError) {
                console.log('Inbound_records表错误:', JSON.stringify(inboundError, null, 2));
            } else {
                console.log('Inbound_records表字段:', inbound.length > 0 ? Object.keys(inbound[0]) : '表为空');
            }
        } catch (error) {
            console.log('Inbound_records表检查失败:', JSON.stringify(error, null, 2));
        }

        // 检查outbound_records表
        console.log('\n📤 Outbound_records表结构:');
        try {
            const { data: outbound, error: outboundError } = await supabase
                .from('outbound_records')
                .select('*')
                .limit(1);
            
            if (outboundError) {
                console.log('Outbound_records表错误:', JSON.stringify(outboundError, null, 2));
            } else {
                console.log('Outbound_records表字段:', outbound.length > 0 ? Object.keys(outbound[0]) : '表为空');
            }
        } catch (error) {
            console.log('Outbound_records表检查失败:', JSON.stringify(error, null, 2));
        }
        
    } catch (error) {
        console.error('检查表结构失败:', error.message);
    }
}

checkTableStructure();