<template>
  <div class="inbound-container">
    <div class="page-header">
      <h2>商品入库</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        新增入库
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="入库日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 入库记录列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="inboundRecords"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="product.name" label="商品名称" width="150" />
        <el-table-column prop="product.brand" label="品牌" width="120" />
        <el-table-column prop="product.specification" label="规格" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="unitPrice" label="单价" width="100">
          <template #default="scope">
            ¥{{ scope.row.unitPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="inboundDate" label="入库日期" width="120" />
        <el-table-column prop="supplier.name" label="供应商" width="120" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewDetail(scope.row)">查看</el-button>
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

    <!-- 新增入库对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="新增入库"
      width="800px"
    >
      <el-form
        ref="inboundFormRef"
        :model="inboundForm"
        :rules="inboundRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品" prop="productId">
              <el-select
                v-model="inboundForm.productId"
                placeholder="请选择商品"
                filterable
                style="width: 100%"
                @change="onProductChange"
              >
                <el-option
                  v-for="product in productOptions"
                  :key="product.id"
                  :label="`${product.name} - ${product.brand} ${product.specification ? '(' + product.specification + ')' : ''}`"
                  :value="product.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierId">
              <el-select
                v-model="inboundForm.supplierId"
                placeholder="请选择供应商"
                style="width: 100%"
                @change="onSupplierChange"
              >
                <el-option
                  v-for="supplier in supplierOptions"
                  :key="supplier.id"
                  :label="supplier.name"
                  :value="supplier.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入库数量" prop="quantity">
              <el-input-number
                v-model="inboundForm.quantity"
                :min="1"
                style="width: 100%"
                @change="calculateTotal"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购单价" prop="purchasePrice">
              <el-input-number
                v-model="inboundForm.purchasePrice"
                :precision="2"
                :step="0.1"
                :min="0"
                style="width: 100%"
                @change="calculateTotal"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总金额">
              <el-input
                :value="`¥${totalAmount.toFixed(2)}`"
                readonly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库日期" prop="inboundDate">
              <el-date-picker
                v-model="inboundForm.inboundDate"
                type="date"
                placeholder="选择入库日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input
            v-model="inboundForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveInbound">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="入库详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商品名称">{{ detailData.product?.name || '未知商品' }}</el-descriptions-item>
        <el-descriptions-item label="品牌">{{ detailData.product?.brand || '-' }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ detailData.product?.specification || '-' }}</el-descriptions-item>
        <el-descriptions-item label="入库数量">{{ detailData.quantity }} 件</el-descriptions-item>
        <el-descriptions-item label="采购单价">¥{{ detailData.unit_price?.toFixed(2) || '0.00' }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ detailData.total_amount?.toFixed(2) || '0.00' }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ detailData.supplier?.name || '未知供应商' }}</el-descriptions-item>
        <el-descriptions-item label="入库日期">{{ detailData.date || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作员">{{ detailData.created_by || '系统' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.notes || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import supabaseInboundService from '@/utils/supabaseInbound.js'
import supabaseProductService from '@/utils/supabase.js'
import supabaseSupplierService from '@/utils/supabaseSupplier.js'
import { formatDate } from '@/utils/date'

// 响应式数据
const loading = ref(false)
const inboundRecords = ref([])
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const inboundFormRef = ref()
const detailData = ref({})

// 搜索表单
const searchForm = reactive({
  productName: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// 入库表单
const inboundForm = reactive({
  productId: '',
  supplierId: '',
  quantity: 1,
  purchasePrice: 0,
  inboundDate: new Date().toISOString().split('T')[0],
  notes: ''
})

// 表单验证规则
const inboundRules = {
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入入库数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur', transform: (value) => Number(value) }
  ],
  purchasePrice: [
    { required: true, message: '请输入采购单价', trigger: 'blur' },
    { type: 'number', min: 0, message: '单价不能为负数', trigger: 'blur', transform: (value) => Number(value) }
  ],
  inboundDate: [
    { required: true, message: '请选择入库日期', trigger: 'change' }
  ]
}

// 商品选项
const productOptions = ref([])

// 供应商选项
const supplierOptions = ref([])

// 获取商品选项
const getProductOptions = async () => {
  try {
    const result = await supabaseProductService.getProducts({ 
      status: 'active', 
      limit: 1000 
    })
    
    if (result.success) {
      productOptions.value = result.data || []
    }
  } catch (error) {
    console.error('获取商品选项失败:', error)
    ElMessage.error('获取商品选项失败')
  }
}

// 获取供应商选项
const getSupplierOptions = async () => {
  try {
    const result = await supabaseSupplierService.getSuppliers({ 
      status: 'active', 
      limit: 1000 
    })
    
    if (result.success) {
      supplierOptions.value = result.data || []
    }
  } catch (error) {
    console.error('获取供应商选项失败:', error)
    ElMessage.error('获取供应商选项失败')
  }
}

// 计算总金额
const totalAmount = computed(() => {
  return inboundForm.quantity * inboundForm.purchasePrice
})

// 获取入库记录
const getInboundRecords = async () => {
  loading.value = true
  try {
    const filters = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }
    
    const result = await supabaseInboundService.getInboundRecords(filters)
    
    if (result.success) {
      inboundRecords.value = result.data || []
      pagination.total = result.pagination?.total || 0
      pagination.pages = result.pagination?.pages || 0
    } else {
      ElMessage.error(result.message || '获取入库记录失败')
    }
  } catch (error) {
    console.error('获取入库记录失败:', error)
    ElMessage.error('获取入库记录失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 商品选择变化处理
const onProductChange = async (productId) => {
  console.log('🔄 商品选择变化:', productId)
  
  if (!productId) {
    // 清空选择时，重置供应商选项和采购单价
    supplierOptions.value = []
    inboundForm.supplierId = ''
    inboundForm.purchasePrice = 0
    return
  }
  
  try {
    // 获取选中的商品信息
    const selectedProduct = productOptions.value.find(p => p.id === productId)
    console.log('🔍 选中的商品信息:', selectedProduct)
    
    // 根据商品ID获取相关供应商
    const result = await supabaseSupplierService.getSuppliersByProductId(productId)
    
    if (result.success) {
      const relatedSuppliers = result.data || []
      
      if (relatedSuppliers.length > 0) {
        // 更新供应商选项为该商品的相关供应商
        supplierOptions.value = relatedSuppliers
        
        // 如果只有一个供应商，自动选择并设置采购单价
        if (relatedSuppliers.length === 1) {
          inboundForm.supplierId = relatedSuppliers[0].id
          // 自动填充采购单价（使用正确的字段名）
          if (selectedProduct && selectedProduct.purchasePrice) {
            inboundForm.purchasePrice = selectedProduct.purchasePrice
          }
          console.log('✅ 自动选择唯一供应商:', relatedSuppliers[0].name)
          // 触发供应商变化处理，获取历史价格
          await onSupplierChange(relatedSuppliers[0].id)
        } else {
          // 清空供应商选择，让用户手动选择
          inboundForm.supplierId = ''
          // 但可以预填充采购单价（使用正确的字段名）
          if (selectedProduct && selectedProduct.purchasePrice) {
            inboundForm.purchasePrice = selectedProduct.purchasePrice
          }
          console.log(`📋 找到 ${relatedSuppliers.length} 个相关供应商，请手动选择`)
        }
      } else {
        // 该商品暂无供应商记录，显示所有活跃供应商供选择
        console.log('⚠️ 该商品暂无配置的供应商，显示所有供应商')
        const allSuppliers = await getAllSuppliers()
        supplierOptions.value = allSuppliers
        inboundForm.supplierId = ''
        // 仍然可以预填充采购单价（使用正确的字段名）
        if (selectedProduct && selectedProduct.purchasePrice) {
          inboundForm.purchasePrice = selectedProduct.purchasePrice
        }
      }
    } else {
      console.error('❌ 获取相关供应商失败:', result.message)
      // 出错时显示所有供应商
      const allSuppliers = await getAllSuppliers()
      supplierOptions.value = allSuppliers
      inboundForm.supplierId = ''
    }
    
  } catch (error) {
    console.error('❌ 处理商品选择变化失败:', error)
    // 出错时显示所有供应商
    const allSuppliers = await getAllSuppliers()
    supplierOptions.value = allSuppliers
    inboundForm.supplierId = ''
  }
}

// 供应商选择变化处理（新增）
const onSupplierChange = async (supplierId) => {
  if (!supplierId || !inboundForm.productId) return
  
  try {
    // 根据历史入库记录获取该商品从该供应商的最近采购价格
    const result = await supabaseInboundService.getLastPurchasePrice(inboundForm.productId, supplierId)
    
    if (result.success && result.data && result.data.unit_price) {
      // 自动填充最近的采购单价
      inboundForm.purchasePrice = result.data.unit_price
      console.log('✅ 自动填充最近采购单价:', result.data.unit_price)
    } else {
      // 兜底逻辑：如果没有历史记录，使用商品的默认采购价格（使用正确的字段名）
      const selectedProduct = productOptions.value.find(p => p.id === inboundForm.productId)
      if (selectedProduct && selectedProduct.purchasePrice) {
        inboundForm.purchasePrice = selectedProduct.purchasePrice
        console.log('✅ 使用商品默认采购价格:', selectedProduct.purchasePrice)
      } else {
        console.log('⚠️ 未找到历史采购价格和商品默认价格')
      }
    }
  } catch (error) {
    console.error('获取历史采购价格失败:', error)
    // 失败时使用兜底逻辑：商品的默认采购价格（使用正确的字段名）
    try {
      const selectedProduct = productOptions.value.find(p => p.id === inboundForm.productId)
      if (selectedProduct && selectedProduct.purchasePrice) {
        inboundForm.purchasePrice = selectedProduct.purchasePrice
        console.log('✅ 兜底使用商品默认采购价格:', selectedProduct.purchasePrice)
      }
    } catch (fallbackError) {
      console.error('兜底逻辑也失败:', fallbackError)
    }
  }
}

// 获取所有供应商（用于筛选）
const getAllSuppliers = async () => {
  try {
    const result = await supabaseSupplierService.getSuppliers({ 
      status: 'active', 
      limit: 1000 
    })
    
    if (result.success) {
      return result.data || []
    }
    return []
  } catch (error) {
    console.error('获取所有供应商失败:', error)
    return []
  }
}

// 计算总金额
const calculateTotal = () => {
  // 总金额会通过computed自动计算
}

// 搜索
const handleSearch = () => {
  getInboundRecords()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    productName: '',
    dateRange: []
  })
  getInboundRecords()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.limit = val
  getInboundRecords()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getInboundRecords()
}

// 保存入库
const saveInbound = async () => {
  if (!inboundFormRef.value) return
  
  try {
    await inboundFormRef.value.validate()
    
    const inboundData = {
      productId: inboundForm.productId,
      supplierId: inboundForm.supplierId,
      quantity: inboundForm.quantity,
      purchasePrice: inboundForm.purchasePrice,
      inboundDate: inboundForm.inboundDate,
      notes: inboundForm.notes
    }
    
    const result = await supabaseInboundService.createInboundRecord(inboundData)
    
    if (result.success) {
      ElMessage.success(result.message || '入库成功')
      showAddDialog.value = false
      resetForm()
      getInboundRecords()
    } else {
      ElMessage.error(result.message || '入库失败')
    }
  } catch (error) {
    console.error('入库失败:', error)
    ElMessage.error('入库失败: ' + error.message)
  }
}

// 查看详情
const viewDetail = (record) => {
  detailData.value = { ...record }
  showDetailDialog.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(inboundForm, {
    productId: '',
    supplierId: '',
    quantity: 1,
    purchasePrice: 0,
    inboundDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  // 重置供应商选项为所有供应商
  getSupplierOptions()
  
  if (inboundFormRef.value) {
    inboundFormRef.value.clearValidate()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getInboundRecords()
  getProductOptions()
  getSupplierOptions()
})
</script>

<style scoped>
.inbound-container {
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