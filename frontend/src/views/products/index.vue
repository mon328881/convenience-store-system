<template>
  <div class="products-container">
    <div class="page-header">
      <h2>商品管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加商品
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input
            v-model="searchForm.brand"
            placeholder="请输入品牌"
            clearable
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
            <el-option label="饮料" value="饮料" />
            <el-option label="零食" value="零食" />
            <el-option label="日用品" value="日用品" />
            <el-option label="烟酒" value="烟酒" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在售" value="active" />
            <el-option label="停售" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 商品列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="products"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="商品名称" width="150" />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="category" label="分类" width="80" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="purchasePrice" label="采购价" width="80">
          <template #default="scope">
            ¥{{ scope.row.purchasePrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="retailPrice" label="零售价" width="80">
          <template #default="scope">
            ¥{{ scope.row.retailPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="currentStock" label="当前库存" width="80">
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.currentStock <= scope.row.stockAlert }">
              {{ scope.row.currentStock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="stockAlert" label="预警值" width="70" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '在售' : '停售' }}
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
            <el-button size="small" @click="editProduct(scope.row)">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteProduct(scope.row._id)"
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

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingProduct ? '编辑商品' : '添加商品'"
      width="600px"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="productForm.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="productForm.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="productForm.category" placeholder="请选择分类">
                <el-option label="饮料" value="饮料" />
                <el-option label="零食" value="零食" />
                <el-option label="日用品" value="日用品" />
                <el-option label="烟酒" value="烟酒" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格" prop="specification">
              <el-input v-model="productForm.specification" placeholder="如：500ml" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购价" prop="purchasePrice">
              <el-input-number
                v-model="productForm.purchasePrice"
                :precision="2"
                :step="0.1"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="零售价" prop="retailPrice">
              <el-input-number
                v-model="productForm.retailPrice"
                :precision="2"
                :step="0.1"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存预警" prop="stockAlert">
              <el-input-number
                v-model="productForm.stockAlert"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="productForm.unit" placeholder="请选择单位">
                <el-option label="瓶" value="瓶" />
                <el-option label="包" value="包" />
                <el-option label="盒" value="盒" />
                <el-option label="袋" value="袋" />
                <el-option label="个" value="个" />
                <el-option label="件" value="件" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="条形码">
          <el-input v-model="productForm.barcode" placeholder="请输入条形码" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="productForm.status">
            <el-radio label="active">在售</el-radio>
            <el-radio label="inactive">停售</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveProduct">确定</el-button>
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
const products = ref([])
const showAddDialog = ref(false)
const editingProduct = ref(null)
const productFormRef = ref()

// 搜索表单
const searchForm = reactive({
  name: '',
  brand: '',
  category: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 商品表单
const productForm = reactive({
  name: '',
  brand: '',
  category: '',
  specification: '',
  purchasePrice: 0,
  retailPrice: 0,
  stockAlert: 10,
  unit: '',
  barcode: '',
  status: 'active'
})

// 表单验证规则
const productRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  brand: [
    { required: true, message: '请输入品牌', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  specification: [
    { required: true, message: '请输入规格', trigger: 'blur' }
  ],
  purchasePrice: [
    { required: true, message: '请输入采购价', trigger: 'blur' }
  ],
  retailPrice: [
    { required: true, message: '请输入零售价', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请选择单位', trigger: 'change' }
  ]
}

// 获取商品列表
const getProducts = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    products.value = [
      {
        _id: '1',
        name: '景田矿泉水',
        brand: '景田',
        category: '饮料',
        specification: '550ml',
        purchasePrice: 1.5,
        retailPrice: 2.0,
        currentStock: 120,
        stockAlert: 20,
        unit: '瓶',
        barcode: '6901234567890',
        status: 'active',
        createdAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        name: '百岁山矿泉水',
        brand: '百岁山',
        category: '饮料',
        specification: '570ml',
        purchasePrice: 1.8,
        retailPrice: 2.5,
        currentStock: 8,
        stockAlert: 15,
        unit: '瓶',
        barcode: '6901234567891',
        status: 'active',
        createdAt: new Date('2024-01-20')
      }
    ]
    pagination.total = products.value.length
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  getProducts()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    brand: '',
    category: '',
    status: ''
  })
  getProducts()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.limit = val
  getProducts()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getProducts()
}

// 编辑商品
const editProduct = (product) => {
  editingProduct.value = product
  Object.assign(productForm, product)
  showAddDialog.value = true
}

// 保存商品
const saveProduct = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingProduct.value) {
      ElMessage.success('商品更新成功')
    } else {
      ElMessage.success('商品添加成功')
    }
    
    showAddDialog.value = false
    resetForm()
    getProducts()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 删除商品
const deleteProduct = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('删除成功')
    getProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(productForm, {
    name: '',
    brand: '',
    category: '',
    specification: '',
    purchasePrice: 0,
    retailPrice: 0,
    stockAlert: 10,
    unit: '',
    barcode: '',
    status: 'active'
  })
  editingProduct.value = null
  if (productFormRef.value) {
    productFormRef.value.clearValidate()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getProducts()
})
</script>

<style scoped>
.products-container {
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

.low-stock {
  color: #f56c6c;
  font-weight: bold;
}
</style>