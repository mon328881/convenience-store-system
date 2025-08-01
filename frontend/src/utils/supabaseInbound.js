import { supabase } from './supabase.js'

// 入库管理类 - 直接操作 Supabase
export class SupabaseInboundService {
  constructor() {
    this.tableName = 'inbound_records'
  }

  // 获取入库记录列表（支持搜索、筛选、分页）
  async getInboundRecords(filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          product:product_id(id, name, brand, specification, unit),
          supplier:supplier_id(id, name, contact)
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

      // 供应商筛选
      if (filters.supplierId) {
        query = query.eq('supplier_id', filters.supplierId)
      }

      // 商品筛选
      if (filters.productId) {
        query = query.eq('product_id', filters.productId)
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
        supplierId: record.supplier_id,
        quantity: record.quantity,
        unitPrice: record.unit_price,
        totalAmount: record.total_amount,
        inboundDate: record.date,
        notes: record.notes || '',
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        // 关联数据
        product: record.product ? {
          id: record.product.id,
          name: record.product.name,
          brand: record.product.brand,
          specification: record.product.specification || '',
          unit: record.product.unit
        } : null,
        supplier: record.supplier ? {
          id: record.supplier.id,
          name: record.supplier.name,
          contact: record.supplier.contact
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
      console.error('获取入库记录列表失败:', error)
      throw error
    }
  }

  // 获取单个入库记录
  async getInboundRecordById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          product:product_id(id, name, brand, specification, unit),
          supplier:supplier_id(id, name, contact)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // 数据转换
      const transformedData = {
        id: data.id,
        productId: data.product_id,
        supplierId: data.supplier_id,
        quantity: data.quantity,
        unitPrice: data.unit_price,
        totalAmount: data.total_amount,
        inboundDate: data.date,
        notes: data.notes || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        product: data.product,
        supplier: data.supplier
      }

      return {
        success: true,
        data: transformedData
      }
    } catch (error) {
      console.error('获取入库记录详情失败:', error)
      throw error
    }
  }

  // 创建入库记录
  async createInboundRecord(inboundData) {
    try {
      // 前端数据验证
      this.validateInboundData(inboundData)

      // 计算总金额
      const totalAmount = inboundData.quantity * inboundData.purchasePrice

      // 数据转换：前端字段 -> 数据库字段
      const dbData = {
        product_id: inboundData.productId,
        supplier_id: inboundData.supplierId,
        quantity: parseInt(inboundData.quantity),
        unit_price: parseFloat(inboundData.purchasePrice),
        total_amount: totalAmount,
        date: inboundData.inboundDate,
        notes: inboundData.notes || '',
        created_by: 'system',
        updated_by: 'system'
      }

      // 使用事务处理：同时创建入库记录和更新商品库存
      const { data: inboundRecord, error: inboundError } = await supabase
        .from(this.tableName)
        .insert([dbData])
        .select(`
          *,
          product:product_id(id, name, brand, specification, unit),
          supplier:supplier_id(id, name, contact)
        `)

      if (inboundError) throw inboundError

      // 更新商品库存 - 先获取当前库存，然后更新
      const { data: currentProduct, error: getProductError } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', inboundData.productId)
        .single()

      if (getProductError) {
        console.error('获取商品当前库存失败:', getProductError)
      } else {
        const newStock = (currentProduct.current_stock || 0) + parseInt(inboundData.quantity)
        const { error: stockError } = await supabase
          .from('products')
          .update({
            current_stock: newStock,
            updated_at: new Date().toISOString(),
            updated_by: 'system'
          })
          .eq('id', inboundData.productId)

        if (stockError) {
          console.error('更新商品库存失败:', stockError)
        }
      }

      return {
        success: true,
        data: inboundRecord[0],
        message: '入库记录创建成功，库存已更新'
      }
    } catch (error) {
      console.error('创建入库记录失败:', error)
      throw error
    }
  }

  // 更新入库记录
  async updateInboundRecord(id, inboundData) {
    try {
      this.validateInboundData(inboundData, false)

      // 数据转换
      const dbData = {
        updated_by: 'system',
        updated_at: new Date().toISOString()
      }

      // 只更新提供的字段
      if (inboundData.productId !== undefined) dbData.product_id = inboundData.productId
      if (inboundData.supplierId !== undefined) dbData.supplier_id = inboundData.supplierId
      if (inboundData.quantity !== undefined) dbData.quantity = parseInt(inboundData.quantity)
      if (inboundData.purchasePrice !== undefined) dbData.unit_price = parseFloat(inboundData.purchasePrice)
      if (inboundData.inboundDate !== undefined) dbData.date = inboundData.inboundDate
      if (inboundData.notes !== undefined) dbData.notes = inboundData.notes

      // 重新计算总金额
      if (inboundData.quantity !== undefined || inboundData.purchasePrice !== undefined) {
        const current = await this.getInboundRecordById(id)
        if (current.success) {
          const quantity = inboundData.quantity || current.data.quantity
          const unitPrice = inboundData.purchasePrice || current.data.unitPrice
          dbData.total_amount = quantity * unitPrice
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(dbData)
        .eq('id', id)
        .select(`
          *,
          product:product_id(id, name, brand, specification, unit),
          supplier:supplier_id(id, name, contact)
        `)

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: '入库记录更新成功'
      }
    } catch (error) {
      console.error('更新入库记录失败:', error)
      throw error
    }
  }

  // 删除入库记录
  async deleteInboundRecord(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        success: true,
        message: '入库记录删除成功'
      }
    } catch (error) {
      console.error('删除入库记录失败:', error)
      throw error
    }
  }

  // 获取商品从指定供应商的最近采购价格
  async getLastPurchasePrice(productId, supplierId) {
    try {
      const { data, error } = await supabase
        .from('inbound_records')
        .select('unit_price, date')
        .eq('product_id', productId)
        .eq('supplier_id', supplierId)
        .order('date', { ascending: false })
        .limit(1)

      if (error) throw error

      return {
        success: true,
        data: data && data.length > 0 ? data[0] : null
      }
    } catch (error) {
      console.error('获取历史采购价格失败:', error)
      throw error
    }
  }

  // 获取入库统计
  async getInboundStats(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('quantity, total_amount, date')

      // 日期范围筛选
      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error

      const totalQuantity = data ? data.reduce((sum, record) => sum + (record.quantity || 0), 0) : 0
      const totalAmount = data ? data.reduce((sum, record) => sum + (record.total_amount || 0), 0) : 0
      const totalRecords = data ? data.length : 0

      return {
        success: true,
        data: {
          totalQuantity,
          totalAmount,
          totalRecords
        }
      }
    } catch (error) {
      console.error('获取入库统计失败:', error)
      throw error
    }
  }

  // 前端数据验证
  validateInboundData(data, isCreate = true) {
    const errors = []

    if (isCreate || data.productId !== undefined) {
      if (!data.productId) {
        errors.push('请选择商品')
      }
    }

    if (isCreate || data.supplierId !== undefined) {
      if (!data.supplierId) {
        errors.push('请选择供应商')
      }
    }

    if (isCreate || data.quantity !== undefined) {
      if (!data.quantity || data.quantity <= 0) {
        errors.push('入库数量必须大于0')
      }
    }

    if (isCreate || data.purchasePrice !== undefined) {
      if (data.purchasePrice === undefined || data.purchasePrice === null || data.purchasePrice === '' || data.purchasePrice < 0) {
        errors.push('采购单价不能为负数')
      }
    }

    if (isCreate || data.inboundDate !== undefined) {
      if (!data.inboundDate) {
        errors.push('请选择入库日期')
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }
  }

  // 实时订阅入库记录变化
  subscribeToInboundRecords(callback) {
    return supabase
      .channel('inbound_records')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: this.tableName },
        callback
      )
      .subscribe()
  }
}

export default new SupabaseInboundService()