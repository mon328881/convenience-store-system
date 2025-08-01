<template>
  <div class="suppliers-container">
    <div class="page-header">
      <h2>供应商管理</h2>
      <el-button type="primary" @click="addSupplier">
        <el-icon><Plus /></el-icon>
        添加供应商
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="供应商名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入供应商名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="请选择状态" 
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 供应商列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="suppliers"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="供应商名称" min-width="120" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="address" label="地址" min-width="150" show-overflow-tooltip />
        <el-table-column prop="products" label="供货商品" min-width="200">
          <template #default="{ row }">
            <!-- 修复：显示通过关系查询获取的商品 -->
            <el-tag 
              v-for="product in (row.relatedProducts || []).slice(0, 3)" 
              :key="product.id" 
              size="small" 
              class="mr-1"
            >
              {{ product.name }}
            </el-tag>
            <el-tag v-if="(row.relatedProducts || []).length > 3" size="small" type="info">
              +{{ (row.relatedProducts || []).length - 3 }}
            </el-tag>
            <!-- 如果没有关联商品，显示提示 -->
            <span v-if="!(row.relatedProducts || []).length" class="text-gray-400">
              暂无关联商品
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="付款方式" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              :icon="Edit"
              @click="editSupplier(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              :icon="Delete"
              @click="deleteSupplier(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加/编辑供应商对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingSupplier ? '编辑供应商' : '添加供应商'"
      width="600px"
    >
      <el-form
        ref="supplierFormRef"
        :model="supplierForm"
        :rules="supplierRules"
        label-width="100px"
      >
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="supplierForm.name" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="supplierForm.contact" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="supplierForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="供货商品" prop="products">
          <el-select 
            v-model="supplierForm.products" 
            multiple 
            placeholder="请选择供货商品"
            style="width: 100%"
          >
            <el-option
              v-for="product in productOptions"
              :key="product.value"
              :label="product.label"
              :value="product.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="付款方式" prop="paymentMethod">
          <el-select v-model="supplierForm.paymentMethod" placeholder="请选择付款方式">
            <el-option label="现金" value="现金" />
            <el-option label="银行转账" value="银行转账" />
            <el-option label="支票" value="支票" />
            <el-option label="月结" value="月结" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否开票">
          <el-switch v-model="supplierForm.needInvoice" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input
            v-model="supplierForm.address"
            type="textarea"
            :rows="2"
            placeholder="请输入地址"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="supplierForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="supplierForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveSupplier">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import supabaseSupplierService from '@/utils/supabaseSupplier.js'
import supabaseProductService from '@/utils/supabase.js'

// 响应式数据
const loading = ref(false)
const suppliers = ref([])
const selectedSuppliers = ref([])
const showAddDialog = ref(false)
const editingSupplier = ref(null)
const supplierFormRef = ref()
const productOptions = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  pages: 0
})

// 供应商表单
const supplierForm = reactive({
  name: '',
  contact: '',
  phone: '',
  address: '',
  paymentMethod: '',
  needInvoice: false,
  status: 'active',
  notes: '',
  products: [] // 重新添加商品字段，用于存储商品ID
})

// 表单验证规则，重新添加products字段验证
const supplierRules = {
  name: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '请选择付款方式', trigger: 'change' }
  ],
  products: [
    { required: true, message: '请选择供货商品', trigger: 'change' }
  ]
}

// 获取供应商列表
const getSuppliers = async () => {
  loading.value = true
  try {
    const result = await supabaseSupplierService.getSuppliers({
      keyword: searchForm.keyword,
      status: searchForm.status,
      page: pagination.current,
      limit: pagination.pageSize
    })
    
    if (result.success) {
      suppliers.value = result.data
      pagination.total = result.pagination?.total || 0
      pagination.pages = result.pagination?.pages || 0
    }
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    ElMessage.error(error.message || '获取供应商列表失败')
  } finally {
    loading.value = false
  }
}

// 获取商品选项（用于供应商表单中的商品选择）
const getProductOptions = async () => {
  try {
    const result = await supabaseProductService.getProducts({ limit: 1000 })
    productOptions.value = result.data.map(product => ({
      label: product.name,
      value: product.id // 使用商品ID作为值
    }))
  } catch (error) {
    console.error('获取商品选项失败:', error)
    // 如果获取失败，使用空数组
    productOptions.value = []
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.current = 1
  getSuppliers()
}

const handleCurrentChange = (page) => {
  pagination.current = page
  getSuppliers()
}

// 添加供应商
const addSupplier = () => {
  resetForm()
  showAddDialog.value = true
}

// 编辑供应商
const editSupplier = (supplier) => {
  editingSupplier.value = supplier
  
  // 获取供应商关联的商品ID数组
  const productIds = (supplier.relatedProducts || []).map(product => product.id)
  
  Object.assign(supplierForm, {
    name: supplier.name,
    contact: supplier.contact,
    phone: supplier.phone,
    address: supplier.address || '',
    paymentMethod: supplier.payment_method || '',
    needInvoice: supplier.need_invoice || false,
    status: supplier.status,
    notes: supplier.notes || '',
    products: productIds // 设置关联的商品ID数组
  })
  
  showAddDialog.value = true
}

// 修改保存供应商函数，包含products字段
const saveSupplier = async () => {
  if (!supplierFormRef.value) return
  
  try {
    await supplierFormRef.value.validate()
    
    // 准备提交数据，包含products字段
    const submitData = {
      name: supplierForm.name,
      contact: supplierForm.contact,
      phone: supplierForm.phone,
      paymentMethod: supplierForm.paymentMethod,
      needInvoice: supplierForm.needInvoice,
      address: supplierForm.address,
      notes: supplierForm.notes,
      status: supplierForm.status,
      products: supplierForm.products // 包含商品ID数组
    }
    
    let result
    if (editingSupplier.value) {
      // 更新供应商
      result = await supabaseSupplierService.updateSupplier(editingSupplier.value.id, submitData)
    } else {
      // 创建供应商
      result = await supabaseSupplierService.createSupplier(submitData)
    }
    
    ElMessage.success(result.message || (editingSupplier.value ? '供应商更新成功' : '供应商添加成功'))
    showAddDialog.value = false
    resetForm()
    getSuppliers()
    
  } catch (error) {
    console.error('保存供应商失败:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除供应商
const deleteSupplier = async (supplier) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除供应商 "${supplier.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await supabaseSupplierService.deleteSupplier(supplier.id)
    ElMessage.success(result.message || '删除成功')
    getSuppliers()
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除供应商失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除供应商
const batchDeleteSuppliers = async () => {
  if (selectedSuppliers.value.length === 0) {
    ElMessage.warning('请选择要删除的供应商')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedSuppliers.value.length} 个供应商吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedSuppliers.value.map(supplier => supplier.id)
    const result = await supabaseSupplierService.deleteSuppliers(ids)
    
    ElMessage.success(result.message || '批量删除成功')
    selectedSuppliers.value = []
    getSuppliers()
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除供应商失败:', error)
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getSuppliers()
}

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  pagination.current = 1
  getSuppliers()
}

// 重置表单
const resetForm = () => {
  Object.assign(supplierForm, {
    name: '',
    contact: '',
    phone: '',
    address: '',
    paymentMethod: '',
    needInvoice: false,
    status: 'active',
    notes: '',
    products: [] // 重置商品字段为空数组
  })
  editingSupplier.value = null
  if (supplierFormRef.value) {
    supplierFormRef.value.clearValidate()
  }
}

// 生命周期 - 重新添加getProductOptions调用
onMounted(() => {
  getSuppliers()
  getProductOptions() // 重新添加获取商品选项
})
</script>

<style scoped>
.suppliers-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-bar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-form {
  margin: 0;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>