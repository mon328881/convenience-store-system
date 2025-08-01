#!/usr/bin/env node

/**
 * 查询线上Supabase数据库的实际表结构
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// 从根目录加载环境变量
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少Supabase配置信息');
    console.log('请确保.env文件包含:');
    console.log('SUPABASE_URL=...');
    console.log('SUPABASE_SERVICE_KEY=...');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOnlineDatabaseStructure() {
    console.log('🔍 正在查询线上Supabase数据库结构...\n');
    
    try {
        // 直接查询各个表的数据来推断结构
        console.log('📋 查询suppliers表结构...');
        const { data: suppliersData, error: suppliersError } = await supabase
            .from('suppliers')
            .select('*')
            .limit(1);

        console.log('📋 查询products表结构...');
        const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        console.log('📋 查询inbound_records表结构...');
        const { data: inboundData, error: inboundError } = await supabase
            .from('inbound_records')
            .select('*')
            .limit(1);

        console.log('📋 查询outbound_records表结构...');
        const { data: outboundData, error: outboundError } = await supabase
            .from('outbound_records')
            .select('*')
            .limit(1);

        // 分析表结构
        const tables = [
            { name: 'suppliers', data: suppliersData, error: suppliersError },
            { name: 'products', data: productsData, error: productsError },
            { name: 'inbound_records', data: inboundData, error: inboundError },
            { name: 'outbound_records', data: outboundData, error: outboundError }
        ];

        // 生成数据库结构文档
        let documentContent = '# 线上数据库实际表结构\n\n';
        documentContent += `> 查询时间: ${new Date().toLocaleString()}\n`;
        documentContent += `> 数据库: ${supabaseUrl}\n\n`;

        for (const table of tables) {
            console.log(`\n📋 表: ${table.name}`);
            console.log('=' .repeat(50));
            
            documentContent += `## ${table.name} 表\n\n`;
            
            if (table.error) {
                console.log(`  ❌ 查询失败: ${table.error.message}`);
                documentContent += `**查询失败**: ${table.error.message}\n\n`;
                continue;
            }

            if (!table.data || table.data.length === 0) {
                console.log('  ⚠️ 表为空或不存在');
                documentContent += '**表为空或不存在**\n\n';
                continue;
            }

            const sampleRecord = table.data[0];
            const fields = Object.keys(sampleRecord);
            
            documentContent += '| 字段名 | 示例值 | 类型推断 |\n';
            documentContent += '|--------|--------|----------|\n';
            
            fields.forEach(field => {
                const value = sampleRecord[field];
                const type = typeof value;
                const displayValue = value === null ? 'null' : 
                                   type === 'object' ? JSON.stringify(value) : 
                                   String(value);
                
                console.log(`  ${field.padEnd(20)} ${displayValue.padEnd(20)} ${type}`);
                documentContent += `| ${field} | ${displayValue} | ${type} |\n`;
            });
            
            documentContent += '\n';
            
            // 特别检查suppliers表的products字段
            if (table.name === 'suppliers' && sampleRecord.products !== undefined) {
                console.log(`\n  🔍 suppliers表products字段详情:`);
                console.log(`     类型: ${typeof sampleRecord.products}`);
                console.log(`     值: ${JSON.stringify(sampleRecord.products)}`);
                
                documentContent += `### suppliers表products字段详情\n`;
                documentContent += `- **类型**: ${typeof sampleRecord.products}\n`;
                documentContent += `- **值**: ${JSON.stringify(sampleRecord.products)}\n\n`;
            }
        }

        // 查询外键关系 - 简化版本
        console.log('\n🔗 检查表关系...');
        
        // 检查products表是否有supplier_id字段
        if (productsData && productsData.length > 0) {
            const hasSupplierIdField = productsData[0].hasOwnProperty('supplier_id');
            console.log(`products表supplier_id字段: ${hasSupplierIdField ? '✅ 存在' : '❌ 不存在'}`);
            if (hasSupplierIdField) {
                console.log(`  值: ${productsData[0].supplier_id}`);
            }
        }

        // 保存到文件
        const outputFile = path.join(__dirname, '..', '线上数据库实际结构.md');
        fs.writeFileSync(outputFile, documentContent, 'utf8');
        
        console.log(`\n✅ 数据库结构已保存到: ${outputFile}`);
        
        // 总结关键发现
        console.log('\n📊 关键发现总结:');
        
        if (suppliersData && suppliersData.length > 0) {
            const hasProductsField = suppliersData[0].hasOwnProperty('products');
            console.log(`🔍 suppliers表products字段: ${hasProductsField ? '✅ 存在' : '❌ 不存在'}`);
            
            if (hasProductsField) {
                const productsField = suppliersData[0].products;
                console.log(`   类型: ${typeof productsField}`);
                console.log(`   值: ${JSON.stringify(productsField)}`);
                
                // 判断是商品ID数组还是商品名称数组
                if (Array.isArray(productsField) && productsField.length > 0) {
                    const firstItem = productsField[0];
                    if (typeof firstItem === 'number') {
                        console.log('   📋 存储格式: 商品ID数组');
                    } else if (typeof firstItem === 'string') {
                        console.log('   📋 存储格式: 商品名称数组');
                    }
                }
            }
        }

        if (productsData && productsData.length > 0) {
            const hasSupplierIdField = productsData[0].hasOwnProperty('supplier_id');
            console.log(`🔍 products表supplier_id字段: ${hasSupplierIdField ? '✅ 存在' : '❌ 不存在'}`);
        }

    } catch (error) {
        console.error('❌ 查询过程中出现错误:', error);
    }
}

// 运行检查
if (require.main === module) {
    checkOnlineDatabaseStructure().then(() => {
        console.log('\n✅ 检查完成');
        process.exit(0);
    }).catch(error => {
        console.error('❌ 检查失败:', error);
        process.exit(1);
    });
}

module.exports = { checkOnlineDatabaseStructure };