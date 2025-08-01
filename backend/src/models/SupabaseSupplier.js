const { supabase } = require('../config/supabase');

class SupabaseSupplier {
  constructor() {
    this.tableName = 'suppliers';
  }

  // 创建供应商
  async create(supplierData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...supplierData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`创建供应商失败: ${error.message}`);
    }
  }

  // 根据ID查找供应商
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(`查找供应商失败: ${error.message}`);
    }
  }

  // 查找所有供应商
  async find(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');

      // 应用过滤条件
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,contact.ilike.%${filters.search}%`);
      }

      // 排序
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`查询供应商失败: ${error.message}`);
    }
  }

  // 更新供应商
  async findByIdAndUpdate(id, updateData) {
    try {
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
      throw new Error(`更新供应商失败: ${error.message}`);
    }
  }

  // 删除供应商
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
      throw new Error(`删除供应商失败: ${error.message}`);
    }
  }

  // 根据条件计数
  async countDocuments(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('id', { count: 'exact' });

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw new Error(`统计供应商数量失败: ${error.message}`);
    }
  }

  // 获取供应商统计信息
  async getStats() {
    try {
      const totalSuppliers = await this.countDocuments();
      return { totalSuppliers };
    } catch (error) {
      throw new Error(`获取供应商统计失败: ${error.message}`);
    }
  }

  // 根据名称查找供应商
  async findByName(name) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('name', name)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(`根据名称查找供应商失败: ${error.message}`);
    }
  }

  // 检查供应商是否存在
  async exists(id) {
    try {
      const supplier = await this.findById(id);
      return !!supplier;
    } catch (error) {
      return false;
    }
  }

  // 批量删除供应商
  async deleteMany(ids) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .in('id', ids)
        .select();

      if (error) throw error;
      return { deletedCount: data ? data.length : 0 };
    } catch (error) {
      throw new Error(`批量删除供应商失败: ${error.message}`);
    }
  }

  // 根据ID列表查找供应商
  async findByIds(ids) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .in('id', ids)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`根据ID列表查找供应商失败: ${error.message}`);
    }
  }

  // 根据商品ID从供应商配置中查找相关供应商
  async findByProductId(productId) {
    try {
      // 首先获取商品信息
      const Product = require('./SupabaseProduct');
      const product = await Product.findById(productId);
      
      if (!product) {
        return [];
      }
      
      // 如果商品有直接的供应商关联，优先使用
      if (product.supplier_id) {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('id', product.supplier_id)
          .eq('status', 'active')
          .single();
      
        if (error) {
          if (error.code === 'PGRST116') {
            return []; // 供应商不存在
          }
          throw error;
        }
        
        return [data];
      }
      
      // 如果没有直接关联，返回空数组
      return [];
    } catch (error) {
      throw new Error(`根据商品ID查找供应商失败: ${error.message}`);
    }
  }
}

module.exports = new SupabaseSupplier();