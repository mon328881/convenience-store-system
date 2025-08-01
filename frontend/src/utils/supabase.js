import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建 Supabase 客户端，配置认证选项
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
})

// 商品管理类 - 直接操作 Supabase
export class SupabaseProductService {
  constructor() {
    this.tableName = 'products'
  }

  // 获取商品列表（支持搜索、筛选、分页）
  async getProducts(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('*')

      // 应用筛选条件
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`)
      }
      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      // 分页
      const page = parseInt(filters.page) || 1
      const limit = parseInt(filters.limit) || 10
      const offset = (page - 1) * limit

      query = query.range(offset, offset + limit - 1)
      query = query.order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error

      // 将数据库字段映射为前端期望的字段名
      const mappedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        category: item.category,
        specification: item.specification || '', // 映射数据库的specification字段
        purchasePrice: item.purchase_price || 0,
        inputPrice: item.input_price || 0,
        retailPrice: item.retail_price || 0,
        currentStock: item.current_stock || 0,
        stockAlert: item.stock_alert || 10,
        unit: item.unit || '个',
        barcode: item.barcode || '',
        status: item.status || 'active',
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        createdBy: item.created_by,
        updatedBy: item.updated_by
      }))

      return {
        success: true,
        data: mappedData,
        pagination: {
          current: page,
          pageSize: limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
      throw error
    }
  }

  // 创建商品
  // 修复创建商品时的重复检查
  async createProduct(productData) {
    try {
      this.validateProductData(productData)
  
      // 检查重复 - 使用ID而不是名称进行更精确的检查
      const { data: existingProducts } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('name', productData.name)
        .eq('brand', productData.brand)
        .eq('category', productData.category) // 添加分类检查
        .eq('status', 'active')
  
      if (existingProducts && existingProducts.length > 0) {
        throw new Error('相同名称、品牌和分类的商品已存在')
      }
  
      // 数据转换
      const dbData = {
        name: productData.name,
        brand: productData.brand,
        category: productData.category,
        specification: productData.specification || '', // 添加规格字段
        price: productData.retailPrice || productData.inputPrice || 0, // price字段不能为空，优先使用零售价
        stock: productData.currentStock || 0,
        purchase_price: productData.purchasePrice || 0,
        input_price: productData.inputPrice || 0,
        retail_price: productData.retailPrice || 0,
        current_stock: productData.currentStock || 0,
        stock_alert: productData.stockAlert || 10,
        unit: productData.unit || '个',
        barcode: productData.barcode || null,
        status: productData.status || 'active',
        created_by: 'system',
        updated_by: 'system'
      }
  
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([dbData])
        .select()
  
      if (error) throw error
  
      return {
        success: true,
        data: data[0]
      }
    } catch (error) {
      console.error('创建商品失败:', error)
      throw error
    }
  }

  // 更新商品
  async updateProduct(id, productData) {
    try {
      this.validateProductData(productData, false)

      // 数据转换，确保字段名匹配数据库
      const dbData = {
        name: productData.name,
        brand: productData.brand,
        category: productData.category,
        specification: productData.specification || '', // 添加规格字段
        price: productData.retailPrice || productData.inputPrice || 0,
        stock: productData.currentStock || 0,
        purchase_price: productData.purchasePrice || 0,
        input_price: productData.inputPrice || 0,
        retail_price: productData.retailPrice || 0,
        current_stock: productData.currentStock || 0,
        stock_alert: productData.stockAlert || 10,
        unit: productData.unit || '个',
        barcode: productData.barcode || null,
        status: productData.status || 'active',
        updated_by: 'system',
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(dbData)
        .eq('id', id)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0]
      }
    } catch (error) {
      console.error('更新商品失败:', error)
      throw error
    }
  }

  // 删除商品
  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        success: true,
        message: '商品删除成功'
      }
    } catch (error) {
      console.error('删除商品失败:', error)
      throw error
    }
  }

  // 获取商品统计
  async getProductStats() {
    try {
      // 获取所有活跃商品
      const { data: products, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active')

      if (error) throw error

      // 前端计算统计数据
      const totalProducts = products.length
      const lowStockProducts = products.filter(p => p.current_stock <= p.stock_alert).length
      const outOfStockProducts = products.filter(p => p.current_stock === 0).length

      // 分类统计
      const categoryStats = {}
      const brandStats = {}

      products.forEach(product => {
        if (product.category) {
          categoryStats[product.category] = (categoryStats[product.category] || 0) + 1
        }
        if (product.brand) {
          brandStats[product.brand] = (brandStats[product.brand] || 0) + 1
        }
      })

      return {
        success: true,
        data: {
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          categoryStats: Object.entries(categoryStats).map(([name, count]) => ({ name, count })),
          brandStats: Object.entries(brandStats).map(([name, count]) => ({ name, count }))
        }
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  }

  // 获取仪表板统计数据
  async getDashboardStats() {
    try {
      // 获取商品统计
      const productStats = await this.getProductStats()
      
      // 获取供应商数量（这里暂时返回固定值，后续可以扩展）
      const totalSuppliers = 0 // TODO: 实现供应商统计
      
      return {
        success: true,
        data: {
          totalProducts: productStats.data.totalProducts,
          totalSuppliers,
          lowStockProducts: productStats.data.lowStockProducts,
          outOfStockProducts: productStats.data.outOfStockProducts
        }
      }
    } catch (error) {
      console.error('获取仪表板统计数据失败:', error)
      throw error
    }
  }

  // 获取分类统计数据
  async getCategoryStats() {
    try {
      const productStats = await this.getProductStats()
      return {
        success: true,
        data: productStats.data.categoryStats.map(item => ({
          id: item.name,
          name: item.name,
          count: item.count
        }))
      }
    } catch (error) {
      console.error('获取分类统计数据失败:', error)
      throw error
    }
  }

  // 获取品牌统计数据
  async getBrandStats() {
    try {
      const productStats = await this.getProductStats()
      return {
        success: true,
        data: productStats.data.brandStats.map(item => ({
          id: item.name,
          name: item.name,
          count: item.count
        }))
      }
    } catch (error) {
      console.error('获取品牌统计数据失败:', error)
      throw error
    }
  }

  // 获取最近入库记录（暂时返回空数组，后续实现）
  async getRecentInbound(limit = 5) {
    try {
      // TODO: 实现入库记录查询
      return []
    } catch (error) {
      console.error('获取最近入库记录失败:', error)
      throw error
    }
  }

  // 获取最近出库记录（暂时返回空数组，后续实现）
  async getRecentOutbound(limit = 5) {
    try {
      // TODO: 实现出库记录查询
      return []
    } catch (error) {
      console.error('获取最近出库记录失败:', error)
      throw error
    }
  }

  // 前端数据验证
  validateProductData(data, isCreate = true) {
    const errors = []

    if (isCreate || data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        errors.push('商品名称不能为空')
      }
    }

    if (isCreate || data.brand !== undefined) {
      if (!data.brand || data.brand.trim() === '') {
        errors.push('品牌不能为空')
      }
    }

    if (isCreate || data.category !== undefined) {
      if (!data.category || data.category.trim() === '') {
        errors.push('商品分类不能为空')
      }
    }

    if (data.purchasePrice !== undefined && (isNaN(data.purchasePrice) || data.purchasePrice < 0)) {
      errors.push('采购价必须为非负数')
    }

    if (data.retailPrice !== undefined && (isNaN(data.retailPrice) || data.retailPrice < 0)) {
      errors.push('零售价必须为非负数')
    }

    if (data.inputPrice !== undefined && (isNaN(data.inputPrice) || data.inputPrice < 0)) {
      errors.push('录入单价必须为非负数')
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }
  }

  // 根据供应商ID获取关联商品
  async getProductsBySupplierId(supplierId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, name, brand, category')
        .eq('supplier_id', supplierId)
        .eq('status', 'active')
        .order('name')

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      console.error('获取供应商关联商品失败:', error)
      throw error
    }
  }

  // 实时订阅商品变化
  subscribeToProducts(callback) {
    return supabase
      .channel('products')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: this.tableName },
        callback
      )
      .subscribe()
  }
}

export default new SupabaseProductService()