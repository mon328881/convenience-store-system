const { supabase } = require('../config/supabase');

class SupabaseProduct {
  constructor() {
    this.tableName = 'products';
    
    // 字段映射：前端camelCase -> 数据库snake_case
    this.fieldMapping = {
      purchasePrice: 'purchase_price',
      inputPrice: 'input_price', 
      retailPrice: 'retail_price',
      stockAlert: 'stock_alert',
      currentStock: 'current_stock',
      totalInbound: 'total_inbound',
      totalOutbound: 'total_outbound',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      createdBy: 'created_by',
      updatedBy: 'updated_by'
    };
    
    // 反向映射：数据库snake_case -> 前端camelCase
    this.reverseFieldMapping = Object.fromEntries(
      Object.entries(this.fieldMapping).map(([key, value]) => [value, key])
    );
  }
  
  // 将前端字段转换为数据库字段
  mapFieldsToDatabase(data) {
    const mapped = {};
    for (const [key, value] of Object.entries(data)) {
      // 使用字段映射，如果没有映射则保持原字段名
      const dbField = this.fieldMapping[key] || key;
      mapped[dbField] = value;
    }
    console.log('字段映射结果:', { 原始数据: data, 映射后: mapped });
    return mapped;
  }
  
  // 将数据库字段转换为前端字段
  mapFieldsFromDatabase(data) {
    if (!data) return data;
    
    const mapped = {};
    for (const [key, value] of Object.entries(data)) {
      const frontendField = this.reverseFieldMapping[key] || key;
      mapped[frontendField] = value;
    }
    return mapped;
  }

  // 创建商品
  async create(productData) {
    try {
      console.log('创建商品，原始数据:', productData);
      
      // 转换字段名为数据库格式，使用现有字段映射缺失字段
      const dbData = this.mapFieldsToDatabase(productData);
      console.log('转换后的数据库数据:', dbData);
      
      // 临时解决方案：将缺失字段映射到现有字段
      const dataToInsert = {
        name: dbData.name,
        category: dbData.category,
        brand: dbData.brand,
        price: dbData.purchase_price || dbData.input_price || dbData.retail_price || dbData.price || 0, // 使用price字段存储主要价格
        stock: dbData.current_stock || dbData.stock || 0, // 使用stock字段存储库存
        status: dbData.status || 'active',
        stock_alert: dbData.stock_alert || 10,
        created_by: dbData.created_by || 'system',
        updated_by: dbData.updated_by || 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('最终插入数据:', dataToInsert);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error('创建商品失败:', error);
        throw error;
      }

      console.log('商品创建成功:', data);
      
      // 转换返回数据为前端格式，映射现有字段到期望字段
      return data.map(item => ({
        ...this.mapFieldsFromDatabase(item),
        purchasePrice: item.price, // 临时映射
        inputPrice: item.price,
        retailPrice: item.price,
        currentStock: item.stock
      }));
    } catch (error) {
      console.error('创建商品异常:', error);
      throw error;
    }
  }

  // 根据ID查找商品
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
      throw new Error(`查找商品失败: ${error.message}`);
    }
  }

  // 查找所有商品
  async find(filters = {}) {
    try {
      console.log('SupabaseProduct.find - 开始查询，过滤条件:', filters);
      
      let query = supabase.from(this.tableName).select('*');

      // 应用过滤条件
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }

      // 排序
      query = query.order('created_at', { ascending: false });

      console.log('SupabaseProduct.find - 执行查询...');
      const { data, error } = await query;
      
      if (error) {
        console.error('SupabaseProduct.find - 查询错误:', error);
        throw error;
      }
      
      console.log('SupabaseProduct.find - 查询成功，返回数据条数:', data ? data.length : 0);
      return data || [];
    } catch (error) {
      console.error('SupabaseProduct.find - 捕获异常:', error);
      throw new Error(`查询商品失败: ${error.message}`);
    }
  }

  // 获取所有商品（别名方法，兼容旧代码）
  async getAll(filters = {}) {
    try {
      console.log('获取商品列表，筛选条件:', filters);
      
      let query = supabase.from(this.tableName).select('*');
      
      // 应用筛选条件
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      
      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      // 分页
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;
      
      query = query.range(offset, offset + limit - 1);
      query = query.order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('获取商品列表失败:', error);
        throw error;
      }
      
      console.log(`获取到 ${data?.length || 0} 个商品`);
      
      // 转换返回数据为前端格式
      const mappedData = data ? data.map(item => this.mapFieldsFromDatabase(item)) : [];
      
      return {
        data: mappedData,
        pagination: {
          page,
          limit,
          total: count || data?.length || 0
        }
      };
    } catch (error) {
      console.error('获取商品列表异常:', error);
      throw error;
    }
  }

  // 更新商品
  async findByIdAndUpdate(id, updateData) {
    try {
      console.log('findByIdAndUpdate - 原始数据:', updateData);
      
      // 转换字段名为数据库格式
      const dbData = this.mapFieldsToDatabase(updateData);
      console.log('findByIdAndUpdate - 转换后数据:', dbData);
      
      // 构建最终更新数据，确保所有字段都存在于数据库中
      const dataToUpdate = {
        updated_at: new Date().toISOString()
      };
      
      // 只添加数据库中实际存在的字段
      const allowedFields = [
        'name', 'category', 'brand', 'price', 'stock', 
        'status', 'stock_alert', 'created_by', 'updated_by',
        'purchase_price', 'retail_price', 'input_price', 'current_stock'
      ];
      
      for (const [key, value] of Object.entries(dbData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          dataToUpdate[key] = value;
        }
      }
      
      console.log('findByIdAndUpdate - 最终更新数据:', dataToUpdate);

      const { data, error } = await supabase
        .from(this.tableName)
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`更新商品失败: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      console.log('更新商品，ID:', id, '原始数据:', updateData);
      
      // 转换字段名为数据库格式
      const dbData = this.mapFieldsToDatabase(updateData);
      console.log('转换后的数据库数据:', dbData);
      
      // 构建最终更新数据，确保所有字段都存在于数据库中
      const dataToUpdate = {
        updated_at: new Date().toISOString(),
        updated_by: dbData.updated_by || 'system'
      };
      
      // 只添加数据库中实际存在的字段
      const allowedFields = [
        'name', 'category', 'brand', 'price', 'stock', 'supplier_id', 
        'status', 'stock_alert', 'created_by', 'updated_by',
        'purchase_price', 'retail_price', 'input_price', 'current_stock'
      ];
      
      for (const [key, value] of Object.entries(dbData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          dataToUpdate[key] = value;
        }
      }
      
      console.log('最终更新数据:', dataToUpdate);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update(dataToUpdate)
        .eq('id', id)
        .select();

      if (error) {
        console.error('更新商品失败:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('商品不存在');
      }

      console.log('商品更新成功:', data[0]);
      
      // 转换返回数据为前端格式
      return this.mapFieldsFromDatabase(data[0]);
    } catch (error) {
      console.error('更新商品异常:', error);
      throw error;
    }
  }

  // 删除商品
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
      throw new Error(`删除商品失败: ${error.message}`);
    }
  }

  // 更新库存
  async updateStock(id, inboundQty = 0, outboundQty = 0) {
    try {
      // 先获取当前商品信息
      const product = await this.findById(id);
      if (!product) {
        throw new Error('商品不存在');
      }

      const newTotalInbound = (product.total_inbound || 0) + inboundQty;
      const newTotalOutbound = (product.total_outbound || 0) + outboundQty;
      const newStock = newTotalInbound - newTotalOutbound;

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          total_inbound: newTotalInbound,
          total_outbound: newTotalOutbound,
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`更新库存失败: ${error.message}`);
    }
  }

  // 获取库存不足的商品
  async getLowStockProducts() {
    try {
      // 先获取所有活跃商品
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active')
        .order('stock', { ascending: true });

      if (error) throw error;
      
      // 在应用层过滤库存不足的商品
      const lowStockProducts = (data || []).filter(product => 
        product.stock <= (product.stock_alert || 0)
      );
      
      return lowStockProducts;
    } catch (error) {
      throw new Error(`查询库存不足商品失败: ${error.message}`);
    }
  }

  // 获取商品统计信息
  async getStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status')
        .eq('status', 'active');

      if (error) throw error;
      
      const totalProducts = data ? data.length : 0;
      
      // 获取库存不足商品数量
      const lowStockProducts = await this.getLowStockProducts();
      const lowStockCount = lowStockProducts.length;

      return {
        totalProducts,
        lowStockCount
      };
    } catch (error) {
      throw new Error(`获取商品统计失败: ${error.message}`);
    }
  }

  // 根据条件计数
  async countDocuments(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('id', { count: 'exact' });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.currentStock !== undefined) {
        query = query.eq('stock', filters.currentStock);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw new Error(`统计商品数量失败: ${error.message}`);
    }
  }

  // 获取分类统计
  async getCategoryStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('category, stock')
        .eq('status', 'active');

      if (error) throw error;

      // 按分类分组统计
      const categoryStats = {};
      if (data) {
        data.forEach(product => {
          const category = product.category || '未分类';
          if (!categoryStats[category]) {
            categoryStats[category] = {
              _id: category,
              count: 0,
              totalStock: 0
            };
          }
          categoryStats[category].count += 1;
          categoryStats[category].totalStock += product.stock || 0;
        });
      }

      // 转换为数组并按数量排序
      return Object.values(categoryStats).sort((a, b) => b.count - a.count);
    } catch (error) {
      throw new Error(`获取分类统计失败: ${error.message}`);
    }
  }

  // 获取品牌统计
  async getBrandStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('brand, stock')
        .eq('status', 'active');

      if (error) throw error;

      // 按品牌分组统计
      const brandStats = {};
      if (data) {
        data.forEach(product => {
          const brand = product.brand || '未知品牌';
          if (!brandStats[brand]) {
            brandStats[brand] = {
              _id: brand,
              count: 0,
              totalStock: 0
            };
          }
          brandStats[brand].count += 1;
          brandStats[brand].totalStock += product.stock || 0;
        });
      }

      // 转换为数组并按数量排序
      return Object.values(brandStats).sort((a, b) => b.count - a.count);
    } catch (error) {
      throw new Error(`获取品牌统计失败: ${error.message}`);
    }
  }

  // 获取库存预警商品（支持限制数量）
  async getLowStockItems(limit = 10) {
    try {
      // 先获取所有活跃商品
      const { data, error } = await supabase
        .from(this.tableName)
        .select('name, brand, stock, stock_alert')
        .eq('status', 'active')
        .order('stock', { ascending: true });

      if (error) throw error;
      
      // 在应用层过滤库存预警商品并限制数量
      const lowStockItems = (data || [])
        .filter(product => product.stock <= (product.stock_alert || 0))
        .slice(0, limit);
      
      return lowStockItems;
    } catch (error) {
      throw new Error(`查询库存预警商品失败: ${error.message}`);
    }
  }
}

module.exports = new SupabaseProduct();