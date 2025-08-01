import { supabase } from './supabase.js'

// 出库管理类 - 直接操作 Supabase
export class SupabaseOutboundService {
  constructor() {
    this.tableName = 'outbound_records'
  }

  // 获取出库记录列表（支持搜索、筛选、分页）
  async getOutboundRecords(filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          product:product_id(id, name, brand, specification, unit, current_stock)
        `)

      // 应用搜索条件
      if (filters.productName) {
        // 通过关联查询商品名称
        query = query.ilike('product.name', `%${filters.productName}%`)
      }

      // 日期范围筛选
      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate)
      }

      // 商品筛选
      if (filters.productId) {
        query = query.eq('product_id', filters.productId)
      }

      // 出库类型筛选
      if (filters.outboundType) {
        query = query.eq('outbound_type', filters.outboundType)
      }

      // 分页
      const page = parseInt(filters.page) || 1
      const limit = parseInt(filters.limit) || 10
      const offset = (page - 1) * limit

      // 获取总数
      const { count } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      // 获取分页数据
      query = query.range(offset, offset + limit - 1)
      query = query.order('date', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // 数据转换：数据库字段 -> 前端字段
      const transformedData = (data || []).map(record => ({
        id: record.id,
        productId: record.product_id,
        quantity: record.quantity,
        unitPrice: record.unit_price,
        totalAmount: record.total_amount,
        outboundDate: record.date,
        outboundType: record.outbound_type,
        notes: record.notes || '',
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        // 关联数据
        product: record.product ? {
          id: record.product.id,
          name: record.product.name,
          brand: record.product.brand,
          specification: record.product.specification || '',
          unit: record.product.unit,
          stockQuantity: record.product.current_stock
        } : null
      }))

      return {
        success: true,
        data: transformedData,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    } catch (error) {
      console.error('获取出库记录列表失败:', error)
      throw error
    }
  }

  // 获取单个出库记录
  async getOutboundRecordById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          product:product_id(id, name, brand, specification, unit, current_stock)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // 数据转换
      const transformedData = {
        id: data.id,
        productId: data.product_id,
        quantity: data.quantity,
        unitPrice: data.unit_price,
        totalAmount: data.total_amount,
        outboundDate: data.date,
        outboundType: data.outbound_type,
        notes: data.notes || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        product: data.product
      }

      return {
        success: true,
        data: transformedData
      }
    } catch (error) {
      console.error('获取出库记录详情失败:', error)
      throw error
    }
  }

  // 创建出库记录
  async createOutboundRecord(outboundData) {
    try {
      // 前端数据验证
      this.validateOutboundData(outboundData)

      // 检查库存是否充足
      await this.checkStock(outboundData.productId, outboundData.quantity)

      // 计算总金额
      const totalAmount = outboundData.quantity * outboundData.salePrice

      // 数据转换：前端字段 -> 数据库字段
      const dbData = {
        product_id: outboundData.productId,
        quantity: parseInt(outboundData.quantity),
        unit_price: parseFloat(outboundData.salePrice),
        total_amount: totalAmount,
        date: outboundData.outboundDate,
        outbound_type: outboundData.outboundType || 'sale',
        notes: outboundData.notes || '',
        created_by: 'system',
        updated_by: 'system'
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([dbData])
        .select(`
          *,
          product:product_id(id, name, brand, specification, unit, current_stock)
        `)

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: '出库记录创建成功'
      }
    } catch (error) {
      console.error('创建出库记录失败:', error)
      throw error
    }
  }

  // 更新出库记录
  async updateOutboundRecord(id, outboundData) {
    try {
      this.validateOutboundData(outboundData, false)

      // 数据转换
      const dbData = {
        updated_by: 'system',
        updated_at: new Date().toISOString()
      }

      // 只更新提供的字段
      if (outboundData.productId !== undefined) dbData.product_id = outboundData.productId
      if (outboundData.quantity !== undefined) {
        // 检查库存
        await this.checkStock(outboundData.productId, outboundData.quantity)
        dbData.quantity = parseInt(outboundData.quantity)
      }
      if (outboundData.salePrice !== undefined) dbData.unit_price = parseFloat(outboundData.salePrice)
      if (outboundData.outboundDate !== undefined) dbData.date = outboundData.outboundDate
      if (outboundData.outboundType !== undefined) dbData.outbound_type = outboundData.outboundType
      if (outboundData.notes !== undefined) dbData.notes = outboundData.notes

      // 重新计算总金额
      if (outboundData.quantity !== undefined || outboundData.salePrice !== undefined) {
        const current = await this.getOutboundRecordById(id)
        if (current.success) {
          const quantity = outboundData.quantity || current.data.quantity
          const unitPrice = outboundData.salePrice || current.data.unitPrice
          dbData.total_amount = quantity * unitPrice
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(dbData)
        .eq('id', id)
        .select(`
          *,
          product:product_id(id, name, brand, specification, unit, current_stock)
        `)

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: '出库记录更新成功'
      }
    } catch (error) {
      console.error('更新出库记录失败:', error)
      throw error
    }
  }

  // 删除出库记录
  async deleteOutboundRecord(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        success: true,
        message: '出库记录删除成功'
      }
    } catch (error) {
      console.error('删除出库记录失败:', error)
      throw error
    }
  }

  // 获取出库统计
  async getOutboundStats(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('quantity, total_amount, date, outbound_type')

      // 日期范围筛选
      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error

      const totalQuantity = data ? data.reduce((sum, record) => sum + (record.quantity || 0), 0) : 0
      const totalAmount = data ? data.reduce((sum, record) => sum + (record.total_amount || 0), 0) : 0
      const totalRecords = data ? data.length : 0

      // 按出库类型统计
      const typeStats = {}
      if (data) {
        data.forEach(record => {
          const type = record.outbound_type || 'sale'
          if (!typeStats[type]) {
            typeStats[type] = { quantity: 0, amount: 0, count: 0 }
          }
          typeStats[type].quantity += record.quantity || 0
          typeStats[type].amount += record.total_amount || 0
          typeStats[type].count += 1
        })
      }

      return {
        success: true,
        data: {
          totalQuantity,
          totalAmount,
          totalRecords,
          typeStats
        }
      }
    } catch (error) {
      console.error('获取出库统计失败:', error)
      throw error
    }
  }

  // 检查库存是否充足
  async checkStock(productId, quantity) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('current_stock, name')
        .eq('id', productId)
        .single()

      if (error) throw error

      if (!data) {
        throw new Error('商品不存在')
      }

      if (data.current_stock < quantity) {
        throw new Error(`库存不足！当前库存：${data.current_stock}，需要：${quantity}`)
      }

      return true
    } catch (error) {
      console.error('检查库存失败:', error)
      throw error
    }
  }

  // 前端数据验证
  validateOutboundData(data, isCreate = true) {
    const errors = []

    if (isCreate || data.productId !== undefined) {
      if (!data.productId) {
        errors.push('请选择商品')
      }
    }

    if (isCreate || data.quantity !== undefined) {
      if (!data.quantity || data.quantity <= 0) {
        errors.push('出库数量必须大于0')
      }
    }

    if (isCreate || data.salePrice !== undefined) {
      if (data.salePrice === undefined || data.salePrice < 0) {
        errors.push('销售单价不能为负数')
      }
    }

    if (isCreate || data.outboundDate !== undefined) {
      if (!data.outboundDate) {
        errors.push('请选择出库日期')
      }
    }

    if (isCreate || data.outboundType !== undefined) {
      const validTypes = ['sale', 'return', 'damage', 'transfer', 'other']
      if (data.outboundType && !validTypes.includes(data.outboundType)) {
        errors.push('出库类型无效')
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }
  }

  // 实时订阅出库记录变化
  subscribeToOutboundRecords(callback) {
    return supabase
      .channel('outbound_records')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: this.tableName },
        callback
      )
      .subscribe()
  }
}

export default new SupabaseOutboundService()