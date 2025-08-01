import { supabase } from './supabase.js'

// 供应商管理类 - 直接操作 Supabase
export class SupabaseSupplierService {
  constructor() {
    this.tableName = 'suppliers'
  }

  // 获取供应商列表（支持搜索、筛选、分页）
  async getSuppliers(filters = {}) {
    try {
      // 构建查询，包含关联的商品信息（通过多对多关系表）
      let query = supabase.from(this.tableName).select(`
        *,
        supplier_products (
          product_id,
          is_primary,
          products (
            id,
            name,
            category
          )
        )
      `)

      // 应用搜索过滤
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,contact.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
      }

      // 应用状态过滤
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      // 排序
      query = query.order('created_at', { ascending: false })

      // 分页
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize
        const to = from + filters.pageSize - 1
        query = query.range(from, to)
      }

      const { data, error } = await query

      if (error) throw error

      // 转换数据格式，添加关联商品信息
      const transformedData = data.map(supplier => ({
        ...supplier,
        relatedProducts: supplier.supplier_products?.map(sp => ({
          id: sp.products.id,
          name: sp.products.name,
          category: sp.products.category,
          isPrimary: sp.is_primary
        })) || []
      }))

      return {
        success: true,
        data: transformedData,
        message: '获取供应商列表成功'
      }
    } catch (error) {
      console.error('获取供应商列表失败:', error)
      throw error
    }
  }

  // 获取单个供应商
  async getSupplierById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          supplier_products (
            product_id,
            is_primary,
            products (
              id,
              name,
              category
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // 转换数据格式，添加关联商品信息
      const transformedData = {
        ...data,
        relatedProducts: data.supplier_products?.map(sp => ({
          id: sp.products.id,
          name: sp.products.name,
          category: sp.products.category,
          isPrimary: sp.is_primary
        })) || []
      }

      return {
        success: true,
        data: transformedData,
        message: '获取供应商详情成功'
      }
    } catch (error) {
      console.error('获取供应商详情失败:', error)
      throw error
    }
  }

  // 创建供应商
  async createSupplier(supplierData) {
    try {
      // 验证数据
      this.validateSupplierData(supplierData, true)

      // 转换前端字段到数据库字段
      const dbData = {
        name: supplierData.name,
        contact: supplierData.contact,
        phone: supplierData.phone,
        address: supplierData.address || '',
        payment_method: supplierData.paymentMethod || '',
        need_invoice: supplierData.needInvoice || false,
        status: supplierData.status || 'active',
        notes: supplierData.notes || ''
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([dbData])
        .select()

      if (error) throw error

      const newSupplier = data[0]

      // 如果有商品关联，在关联表中创建记录（多对多关系）
      if (supplierData.products && supplierData.products.length > 0) {
        const relationData = supplierData.products.map(productId => ({
          supplier_id: newSupplier.id,
          product_id: productId,
          is_primary: false // 默认不是主要供应商
        }))

        const { error: relationError } = await supabase
          .from('supplier_products')
          .insert(relationData)

        if (relationError) {
          console.error('创建供应商-商品关联失败:', relationError)
          // 不抛出错误，因为供应商已经创建成功
        }
      }

      return {
        success: true,
        data: newSupplier,
        message: '供应商创建成功'
      }
    } catch (error) {
      console.error('创建供应商失败:', error)
      throw error
    }
  }

  // 更新供应商
  async updateSupplier(id, supplierData) {
    try {
      // 验证数据
      this.validateSupplierData(supplierData, false)

      // 转换前端字段到数据库字段
      const dbData = {}
      
      // 只更新提供的字段
      if (supplierData.name !== undefined) dbData.name = supplierData.name
      if (supplierData.contact !== undefined) dbData.contact = supplierData.contact
      if (supplierData.phone !== undefined) dbData.phone = supplierData.phone
      if (supplierData.address !== undefined) dbData.address = supplierData.address
      if (supplierData.paymentMethod !== undefined) dbData.payment_method = supplierData.paymentMethod
      if (supplierData.needInvoice !== undefined) dbData.need_invoice = supplierData.needInvoice
      if (supplierData.status !== undefined) dbData.status = supplierData.status
      if (supplierData.notes !== undefined) dbData.notes = supplierData.notes

      const { data, error } = await supabase
        .from(this.tableName)
        .update(dbData)
        .eq('id', id)
        .select()

      if (error) throw error

      // 如果有商品关联更新，使用多对多关系表
      if (supplierData.products !== undefined) {
        // 获取当前供应商的现有关联
        const { data: currentRelations, error: getCurrentError } = await supabase
          .from('supplier_products')
          .select('product_id')
          .eq('supplier_id', id)

        if (getCurrentError) {
          console.error('获取当前关联失败:', getCurrentError)
        } else {
          const currentProductIds = currentRelations.map(rel => rel.product_id)
          const newProductIds = supplierData.products || []

          // 找出需要删除的关联（当前有但新数据中没有的）
          const toDelete = currentProductIds.filter(pid => !newProductIds.includes(pid))
          
          // 找出需要添加的关联（新数据中有但当前没有的）
          const toAdd = newProductIds.filter(pid => !currentProductIds.includes(pid))

          // 删除不再需要的关联
          if (toDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('supplier_products')
              .delete()
              .eq('supplier_id', id)
              .in('product_id', toDelete)

            if (deleteError) {
              console.error('删除旧关联失败:', deleteError)
            }
          }

          // 添加新的关联
          if (toAdd.length > 0) {
            const relationData = toAdd.map(productId => ({
              supplier_id: id,
              product_id: productId,
              is_primary: false // 默认不是主要供应商
            }))

            const { error: insertError } = await supabase
              .from('supplier_products')
              .insert(relationData)

            if (insertError) {
              console.error('添加新关联失败:', insertError)
            }
          }
        }
      }

      return {
        success: true,
        data: data[0],
        message: '供应商更新成功'
      }
    } catch (error) {
      console.error('更新供应商失败:', error)
      throw error
    }
  }

  // 删除供应商
  async deleteSupplier(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        success: true,
        message: '供应商删除成功'
      }
    } catch (error) {
      console.error('删除供应商失败:', error)
      throw error
    }
  }

  // 批量删除供应商
  async deleteSuppliers(ids) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .in('id', ids)

      if (error) throw error

      return {
        success: true,
        message: `成功删除 ${ids.length} 个供应商`
      }
    } catch (error) {
      console.error('批量删除供应商失败:', error)
      throw error
    }
  }

  // 根据商品ID获取相关供应商（基于supplier_products多对多关系）
  async getSuppliersByProductId(productId) {
    try {
      // 通过supplier_products中间表查找该商品的所有关联供应商
      const { data: supplierProducts, error: supplierProductsError } = await supabase
        .from('supplier_products')
        .select(`
          supplier_id,
          is_primary,
          suppliers (
            id,
            name,
            contact,
            phone,
            status
          )
        `)
        .eq('product_id', productId)
  
      if (supplierProductsError) throw supplierProductsError
  
      if (!supplierProducts || supplierProducts.length === 0) {
        return {
          success: true,
          data: [],
          message: '该商品暂无关联供应商'
        }
      }

      // 提取供应商信息并过滤活跃状态的供应商
      const relatedSuppliers = supplierProducts
        .map(sp => ({
          ...sp.suppliers,
          is_primary: sp.is_primary
        }))
        .filter(supplier => supplier && supplier.status === 'active')

      return {
        success: true,
        data: relatedSuppliers,
        message: `找到 ${relatedSuppliers.length} 个关联供应商`
      }
    } catch (error) {
      console.error('获取商品相关供应商失败:', error)
      return {
        success: false,
        data: [],
        message: '获取供应商失败: ' + error.message
      }
    }
  }

  // 获取供应商统计
  async getSupplierStats() {
    try {
      const { data: suppliers, error } = await supabase
        .from(this.tableName)
        .select('*')

      if (error) throw error

      const totalSuppliers = suppliers.length
      const activeSuppliers = suppliers.filter(s => s.status === 'active').length
      const inactiveSuppliers = suppliers.filter(s => s.status === 'inactive').length

      // 付款方式统计
      const paymentMethodStats = {}
      suppliers.forEach(supplier => {
        if (supplier.payment_method) {
          paymentMethodStats[supplier.payment_method] = (paymentMethodStats[supplier.payment_method] || 0) + 1
        }
      })

      return {
        success: true,
        data: {
          totalSuppliers,
          activeSuppliers,
          inactiveSuppliers,
          paymentMethodStats: Object.entries(paymentMethodStats).map(([name, count]) => ({ name, count }))
        }
      }
    } catch (error) {
      console.error('获取供应商统计失败:', error)
      throw error
    }
  }

  // 前端数据验证
  validateSupplierData(data, isCreate = true) {
    const errors = []

    if (isCreate || data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        errors.push('供应商名称不能为空')
      }
    }

    if (isCreate || data.contact !== undefined) {
      if (!data.contact || data.contact.trim() === '') {
        errors.push('联系人不能为空')
      }
    }

    if (isCreate || data.phone !== undefined) {
      if (!data.phone || data.phone.trim() === '') {
        errors.push('联系电话不能为空')
      }
    }

    if (data.needInvoice !== undefined && typeof data.needInvoice !== 'boolean') {
      errors.push('是否开票必须是布尔值')
    }

    if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
      errors.push('状态必须是active或inactive')
    }

    // 验证商品字段
    if (data.products !== undefined) {
      if (!Array.isArray(data.products)) {
        errors.push('商品必须是数组')
      } else if (isCreate && data.products.length === 0) {
        errors.push('请至少选择一个商品')
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }
  }

  // 实时订阅供应商变化
  subscribeToSuppliers(callback) {
    return supabase
      .channel('suppliers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: this.tableName },
        callback
      )
      .subscribe()
  }
}

export default new SupabaseSupplierService()