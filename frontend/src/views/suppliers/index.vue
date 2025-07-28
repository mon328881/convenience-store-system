<template>
  <div class="suppliers-container">
    <div class="page-header">
      <h2>供应商管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加供应商
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="供应商名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入供应商名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
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
        <el-table-column prop="name" label="供应商名称" width="150" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="products" label="供货商品" width="200">
          <template #default="scope">
            <el-tag
              v-for="product in scope.row.products.slice(0, 3)"
              :key="product"
              size="small"
              style="margin-right: 5px;"
            >
              {{ product }}
            </el-tag>
            <span v-if="scope.row.products.length > 3">...</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="付款方式" width="100" />
        <el-table-column prop="needInvoice" label="是否开票" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.needInvoice ? 'success' : 'info'">
              {{ scope.row.needInvoice ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editSupplier(scope.row)">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteSupplier(scope.row._id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
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
            filterable
            placeholder="请选择供货商品"
            style="width: 100%"
          >
            <el-option
              v-for="option in productOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'
import http from '@/config/http'
import { API_ENDPOINTS } from '@/config/api'

// 响应式数据
const loading = ref(false)
const suppliers = ref([])
const showAddDialog = ref(false)
const editingSupplier = ref(null)
const supplierFormRef = ref()

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 供应商表单
const supplierForm = reactive({
  name: '',
  contact: '',
  phone: '',
  products: [],
  paymentMethod: '',
  needInvoice: false,
  address: '',
  notes: '',
  status: 'active'
})

// 表单验证规则
const supplierRules = {
  name: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  products: [
    { required: true, message: '请选择供货商品', trigger: 'change' }
  ],
  paymentMethod: [
    { required: true, message: '请选择付款方式', trigger: 'change' }
  ]
}

// 商品选项（从商品管理API获取）
const productOptions = ref([])

// 获取商品选项
const getProductOptions = async () => {
  try {
    const response = await http.get(API_ENDPOINTS.PRODUCTS.LIST, {
      params: { limit: 1000 } // 获取所有商品用于选择
    })
    if (response.data.success) {
      // 将商品数据转换为选项格式，使用商品名称作为选项值
      productOptions.value = response.data.data.products?.map(product => ({
        label: `${product.name} (${product.brand})`,
        value: product.name,
        product: product
      })) || []
    } else {
      ElMessage.error(response.data.message || '获取商品选项失败')
    }
  } catch (error) {
      console.error('获取商品选项失败:', error)
      ElMessage.error('获取商品选项失败')
    }
}

// 获取供应商列表
const getSuppliers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }
    
    // 添加搜索条件
    if (searchForm.name) {
      params.search = searchForm.name
    }
    if (searchForm.status) {
      params.status = searchForm.status
    }
    
    const response = await http.get(API_ENDPOINTS.SUPPLIERS.LIST, { params })
    
    if (response.data.success) {
      suppliers.value = response.data.data
      pagination.total = response.data.pagination.total
    } else {
      ElMessage.error(response.data.message || '获取供应商列表失败')
    }
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    ElMessage.error('获取供应商列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  getSuppliers()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    status: ''
  })
  getSuppliers()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.limit = val
  getSuppliers()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getSuppliers()
}

// 编辑供应商
const editSupplier = (supplier) => {
  editingSupplier.value = supplier
  // 处理字段映射
  Object.assign(supplierForm, {
    name: supplier.name,
    contact: supplier.contact,
    phone: supplier.phone,
    products: supplier.products || [],
    paymentMethod: supplier.paymentMethod,
    needInvoice: supplier.hasInvoice || false, // 字段映射
    address: supplier.address || '',
    notes: supplier.remark || '', // 字段映射
    status: supplier.status
  })
  showAddDialog.value = true
}

// 保存供应商
const saveSupplier = async () => {
  if (!supplierFormRef.value) return
  
  try {
    await supplierFormRef.value.validate()
    
    // 准备提交数据，处理字段映射
    const submitData = {
      name: supplierForm.name,
      contact: supplierForm.contact,
      phone: supplierForm.phone,
      products: supplierForm.products,
      paymentMethod: supplierForm.paymentMethod,
      hasInvoice: supplierForm.needInvoice, // 字段映射
      address: supplierForm.address,
      remark: supplierForm.notes, // 字段映射
      status: supplierForm.status,
      createdBy: 'system' // 添加必填字段
    }
    
    let response
    if (editingSupplier.value) {
      // 更新供应商
      submitData.updatedBy = 'system' // 更新时添加updatedBy字段
      response = await http.put(API_ENDPOINTS.SUPPLIERS.UPDATE(editingSupplier.value._id), submitData)
    } else {
      // 创建供应商
      response = await http.post(API_ENDPOINTS.SUPPLIERS.CREATE, submitData)
    }
    
    if (response.data.success) {
      ElMessage.success(response.data.message || (editingSupplier.value ? '供应商更新成功' : '供应商添加成功'))
      showAddDialog.value = false
      resetForm()
      getSuppliers()
    } else {
      ElMessage.error(response.data.message || '操作失败')
    }
  } catch (error) {
    console.error('保存供应商失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('保存失败，请检查网络连接')
    }
  }
}

// 删除供应商
const deleteSupplier = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个供应商吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await http.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id))
    
    if (response.data.success) {
      ElMessage.success(response.data.message || '删除成功')
      getSuppliers()
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除供应商失败:', error)
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('删除失败，请检查网络连接')
      }
    }
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(supplierForm, {
    name: '',
    contact: '',
    phone: '',
    products: [],
    paymentMethod: '',
    needInvoice: false,
    address: '',
    notes: '',
    status: 'active'
  })
  editingSupplier.value = null
  if (supplierFormRef.value) {
    supplierFormRef.value.clearValidate()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getSuppliers()
  getProductOptions()
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