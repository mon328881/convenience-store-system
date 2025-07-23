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
            allow-create
            placeholder="请选择或输入供货商品"
            style="width: 100%"
          >
            <el-option
              v-for="product in productOptions"
              :key="product"
              :label="product"
              :value="product"
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

// 商品选项（模拟数据）
const productOptions = ref([
  '矿泉水', '饮料', '零食', '烟酒', '日用品', '调料', '米面油', '冷冻食品'
])

// 获取供应商列表
const getSuppliers = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    suppliers.value = [
      {
        _id: '1',
        name: '景田饮用水供应商',
        contact: '张经理',
        phone: '13800138001',
        products: ['景田矿泉水', '景田纯净水'],
        paymentMethod: '月结',
        needInvoice: true,
        address: '广东省深圳市',
        notes: '主要供应景田系列产品',
        status: 'active',
        createdAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        name: '百岁山水业',
        contact: '李总',
        phone: '13900139002',
        products: ['百岁山矿泉水'],
        paymentMethod: '银行转账',
        needInvoice: true,
        address: '广东省惠州市',
        notes: '百岁山官方供应商',
        status: 'active',
        createdAt: new Date('2024-01-20')
      }
    ]
    pagination.total = suppliers.value.length
  } catch (error) {
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
  Object.assign(supplierForm, supplier)
  showAddDialog.value = true
}

// 保存供应商
const saveSupplier = async () => {
  if (!supplierFormRef.value) return
  
  try {
    await supplierFormRef.value.validate()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingSupplier.value) {
      ElMessage.success('供应商更新成功')
    } else {
      ElMessage.success('供应商添加成功')
    }
    
    showAddDialog.value = false
    resetForm()
    getSuppliers()
  } catch (error) {
    console.error('表单验证失败:', error)
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
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('删除成功')
    getSuppliers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
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