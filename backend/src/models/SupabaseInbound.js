const { supabase } = require('../config/supabase');

class SupabaseInbound {
  constructor() {
    this.tableName = 'inbound_records';
  }

  // 创建入库记录
  async create(inboundData) {
    try {
      // 计算总金额
      const totalAmount = inboundData.quantity * inboundData.unit_price;
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...inboundData,
          total_amount: totalAmount,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`创建入库记录失败: ${error.message}`);
    }
  }

  // 根据ID查找入库记录
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          products:product_id(id, name, brand),
          suppliers:supplier_id(id, name, contact)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(`查找入库记录失败: ${error.message}`);
    }
  }

  // 查找所有入库记录
  async find(filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          products:product_id(id, name, brand),
          suppliers:supplier_id(id, name, contact)
        `);

      // 应用过滤条件
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.product_id) {
        query = query.eq('product_id', filters.product_id);
      }
      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate);
      }

      // 排序
      query = query.order('date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`查询入库记录失败: ${error.message}`);
    }
  }

  // 更新入库记录
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
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`更新入库记录失败: ${error.message}`);
    }
  }

  // 删除入库记录
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
      throw new Error(`删除入库记录失败: ${error.message}`);
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

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw new Error(`统计入库记录数量失败: ${error.message}`);
    }
  }

  // 获取入库统计信息
  async getStats(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('quantity, total_amount');

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

      return {
        totalQuantity,
        totalAmount,
        totalRecords
      };
    } catch (error) {
      throw new Error(`获取入库统计失败: ${error.message}`);
    }
  }

  // 根据商品ID获取入库记录
  async findByProductId(productId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers:supplier_id(id, name, contact)
        `)
        .eq('product_id', productId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`根据商品ID查找入库记录失败: ${error.message}`);
    }
  }

  // 根据供应商ID获取入库记录
  async findBySupplierId(supplierId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          products:product_id(id, name, brand)
        `)
        .eq('supplier_id', supplierId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`根据供应商ID查找入库记录失败: ${error.message}`);
    }
  }

  // 获取与特定商品相关的供应商ID列表
  async getSupplierIdsByProductId(productId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('supplier_id')
        .eq('product_id', productId)
        .neq('status', 'cancelled');

      if (error) throw error;
      
      // 去重并返回供应商ID数组
      const uniqueSupplierIds = [...new Set(data.map(record => record.supplier_id))];
      return uniqueSupplierIds;
    } catch (error) {
      throw new Error(`获取商品相关供应商ID失败: ${error.message}`);
    }
  }
}

module.exports = new SupabaseInbound();