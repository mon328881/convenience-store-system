const { supabase } = require('../config/supabase');

class SupabaseOutbound {
  constructor() {
    this.tableName = 'outbound_records';
  }

  // 创建出库记录
  async create(outboundData) {
    try {
      // 计算总金额
      const totalAmount = outboundData.quantity * outboundData.unit_price;
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...outboundData,
          total_amount: totalAmount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`创建出库记录失败: ${error.message}`);
    }
  }

  // 根据ID查找出库记录
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          products:product_id(id, name, brand)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(`查找出库记录失败: ${error.message}`);
    }
  }

  // 查找所有出库记录
  async find(filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          products:product_id(id, name, brand)
        `);

      // 应用过滤条件
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.product_id) {
        query = query.eq('product_id', filters.product_id);
      }
      // 移除 outbound_type 过滤条件
      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate);
      }

      // 排序
      query = query.order('date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`查询出库记录失败: ${error.message}`);
    }
  }

  // 更新出库记录
  async findByIdAndUpdate(id, updateData) {
    try {
      // 如果更新了数量或单价，重新计算总金额
      if (updateData.quantity || updateData.unit_price) {
        const current = await this.findById(id);
        if (current) {
          const quantity = updateData.quantity || current.quantity;
          const unitPrice = updateData.unit_price || current.unit_price;
          updateData.total_amount = quantity * unitPrice;
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`更新出库记录失败: ${error.message}`);
    }
  }

  // 删除出库记录
  async findByIdAndDelete(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`删除出库记录失败: ${error.message}`);
    }
  }

  // 根据条件计数
  async countDocuments(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('id', { count: 'exact' });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.product_id) {
        query = query.eq('product_id', filters.product_id);
      }
      // 移除 outbound_type 过滤条件

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw new Error(`统计出库记录数量失败: ${error.message}`);
    }
  }

  // 获取出库统计信息
  async getStats(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('quantity, total_amount'); // 移除 outbound_type

      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const totalQuantity = data ? data.reduce((sum, record) => sum + (record.quantity || 0), 0) : 0;
      const totalAmount = data ? data.reduce((sum, record) => sum + (record.total_amount || 0), 0) : 0;
      const totalRecords = data ? data.length : 0;

      // 简化统计，不按类型分组
      const statsByType = {
        sale: { quantity: totalQuantity, amount: totalAmount, count: totalRecords },
        return: { quantity: 0, amount: 0, count: 0 },
        damage: { quantity: 0, amount: 0, count: 0 },
        other: { quantity: 0, amount: 0, count: 0 }
      };

      return {
        totalQuantity,
        totalAmount,
        totalRecords,
        statsByType
      };
    } catch (error) {
      throw new Error(`获取出库统计失败: ${error.message}`);
    }
  }

  // 根据商品ID获取出库记录
  async findByProductId(productId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('product_id', productId)
        .order('outbound_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`根据商品ID查找出库记录失败: ${error.message}`);
    }
  }

  // 获取销售统计
  async getSalesStats(filters = {}) {
    try {
      // 移除 outbound_type 过滤条件，直接查询所有记录
      const salesFilters = { ...filters };
      return await this.getStats(salesFilters);
    } catch (error) {
      throw new Error(`获取销售统计失败: ${error.message}`);
    }
  }

  // 获取热销商品
  async getHotProducts(limit = 10, filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          product_id,
          quantity,
          products:product_id(id, name, brand)
        `);
        // 移除 outbound_type 过滤条件

      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      // 按商品ID分组统计销量
      const productStats = {};
      data.forEach(record => {
        const productId = record.product_id;
        if (!productStats[productId]) {
          productStats[productId] = {
            product: record.products,
            totalQuantity: 0,
            totalAmount: 0
          };
        }
        productStats[productId].totalQuantity += record.quantity || 0;
      });

      // 转换为数组并排序
      const hotProducts = Object.values(productStats)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);

      return hotProducts;
    } catch (error) {
      throw new Error(`获取热销商品失败: ${error.message}`);
    }
  }

  // 获取销售趋势
  async getSalesTrend(filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('date, quantity, total_amount');
        // 移除 outbound_type 过滤条件

      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate);
      }

      query = query.order('date', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      throw new Error(`获取销售趋势失败: ${error.message}`);
    }
  }
}

module.exports = new SupabaseOutbound();