<template>
  <div class="outbound-container">
    <div class="page-header">
      <h2>商品出库</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Minus /></el-icon>
        新增出库
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
        <el-form-item label="出库日期">
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

    <!-- 出库记录列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="outboundRecords"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="productName" label="商品名称" width="150" />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="quantity" label="出库数量" width="100" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="retailPrice" label="零售单价" width="100">
          <template #default="scope">
            ¥{{ scope.row.retailPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="100">
          <template #default="scope">
            ¥{{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="outboundType" label="出库类型" width="100">
          <template #default="scope">
            <el-tag :type="getOutboundTypeTag(scope.row.outboundType)">
              {{ getOutboundTypeText(scope.row.outboundType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="outboundDate" label="出库日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.outboundDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column prop="notes" label="备注" min-width="120" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看</el-button>
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

    <!-- 新增出库对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="新增出库"
      width="800px"
    >
      <el-form
        ref="outboundFormRef"
        :model="outboundForm"
        :rules="outboundRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品" prop="productId">
              <el-select
                v-model="outboundForm.productId"
                placeholder="请选择商品"
                filterable
                style="width: 100%"
                @change="onProductChange"
              >
                <el-option
                  v-for="product in productOptions"
                  :key="product._id"
                  :label="`${product.name} - ${product.brand} (库存: ${product.currentStock})`"
                  :value="product._id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出库类型" prop="outboundType">
              <el-select
                v-model="outboundForm.outboundType"
                placeholder="请选择出库类型"
                style="width: 100%"
              >
                <el-option label="销售出库" value="sale" />
                <el-option label="损耗出库" value="loss" />
                <el-option label="退货出库" value="return" />
                <el-option label="调拨出库" value="transfer" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出库数量" prop="quantity">
              <el-input-number
                v-model="outboundForm.quantity"
                :min="1"
                :max="selectedProduct?.currentStock || 999"
                style="width: 100%"
                @change="calculateTotal"
              />
              <div v-if="selectedProduct" class="stock-info">
                当前库存: {{ selectedProduct.currentStock }} {{ selectedProduct.unit }}
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="零售单价" prop="retailPrice">
              <el-input-number
                v-model="outboundForm.retailPrice"
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
            <el-form-item label="出库日期" prop="outboundDate">
              <el-date-picker
                v-model="outboundForm.outboundDate"
                type="date"
                placeholder="选择出库日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input
            v-model="outboundForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveOutbound">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="出库详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商品名称">{{ detailData.productName }}</el-descriptions-item>
        <el-descriptions-item label="品牌">{{ detailData.brand }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ detailData.specification }}</el-descriptions-item>
        <el-descriptions-item label="出库数量">{{ detailData.quantity }} {{ detailData.unit }}</el-descriptions-item>
        <el-descriptions-item label="零售单价">¥{{ detailData.retailPrice?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ detailData.totalAmount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="出库类型">
          <el-tag :type="getOutboundTypeTag(detailData.outboundType)">
            {{ getOutboundTypeText(detailData.outboundType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="出库日期">{{ formatDate(detailData.outboundDate) }}</el-descriptions-item>
        <el-descriptions-item label="操作员">{{ detailData.operator }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.notes || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Minus } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'
import http from '@/config/http'
import { API_ENDPOINTS } from '@/config/api'

// 响应式数据
const loading = ref(false)
const outboundRecords = ref([])
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const outboundFormRef = ref()
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
  total: 0
})

// 出库表单
const outboundForm = reactive({
  productId: '',
  outboundType: '',
  quantity: 1,
  retailPrice: 0,
  outboundDate: new Date().toISOString().split('T')[0],
  notes: ''
})

// 表单验证规则
const outboundRules = {
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  outboundType: [
    { required: true, message: '请选择出库类型', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入出库数量', trigger: 'blur' }
  ],
  retailPrice: [
    { required: true, message: '请输入零售单价', trigger: 'blur' }
  ],
  outboundDate: [
    { required: true, message: '请选择出库日期', trigger: 'change' }
  ]
}

// 商品选项
const productOptions = ref([])

// 获取商品选项
const getProductOptions = async () => {
  try {
    const response = await http.get(API_ENDPOINTS.PRODUCTS.LIST)
    if (response.data.success) {
      productOptions.value = response.data.data.records || []
    }
  } catch (error) {
    console.error('获取商品选项失败:', error)
  }
}

// 选中的商品
const selectedProduct = computed(() => {
  return productOptions.value.find(p => p._id === outboundForm.productId)
})

// 计算总金额
const totalAmount = computed(() => {
  return outboundForm.quantity * outboundForm.retailPrice
})

// 获取出库类型标签
const getOutboundTypeTag = (type) => {
  const typeMap = {
    sale: 'success',
    loss: 'danger',
    return: 'warning',
    transfer: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取出库类型文本
const getOutboundTypeText = (type) => {
  const typeMap = {
    sale: '销售出库',
    loss: '损耗出库',
    return: '退货出库',
    transfer: '调拨出库'
  }
  return typeMap[type] || '未知'
}

// 获取出库记录
const getOutboundRecords = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }
    
    const response = await http.get(API_ENDPOINTS.OUTBOUND.LIST, { params })
    
    if (response.data.success) {
      outboundRecords.value = response.data.data.records || []
      pagination.total = response.data.data.total || 0
    } else {
      ElMessage.error(response.data.message || '获取出库记录失败')
    }
  } catch (error) {
    console.error('获取出库记录失败:', error)
    ElMessage.error('获取出库记录失败')
  } finally {
    loading.value = false
  }
}

// 商品选择变化
const onProductChange = (productId) => {
  const product = productOptions.value.find(p => p._id === productId)
  if (product) {
    outboundForm.retailPrice = product.retailPrice
  }
}

// 计算总金额
const calculateTotal = () => {
  // 总金额会通过computed自动计算
}

// 搜索
const handleSearch = () => {
  getOutboundRecords()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    productName: '',
    dateRange: []
  })
  getOutboundRecords()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.limit = val
  getOutboundRecords()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getOutboundRecords()
}

// 保存出库
const saveOutbound = async () => {
  if (!outboundFormRef.value) return
  
  try {
    await outboundFormRef.value.validate()
    
    // 检查库存
    if (selectedProduct.value && outboundForm.quantity > selectedProduct.value.currentStock) {
      ElMessage.error('出库数量不能超过当前库存')
      return
    }
    
    const outboundData = {
      product: outboundForm.productId,
      outboundType: outboundForm.outboundType,
      quantity: outboundForm.quantity,
      unitPrice: outboundForm.retailPrice, // 字段映射
      outboundDate: outboundForm.outboundDate,
      remark: outboundForm.notes, // 字段映射
      createdBy: 'system' // 添加必填字段
    }
    
    const response = await http.post(API_ENDPOINTS.OUTBOUND.CREATE, outboundData)
    
    if (response.data.success) {
      ElMessage.success('出库成功')
      showAddDialog.value = false
      resetForm()
      getOutboundRecords()
    } else {
      ElMessage.error(response.data.message || '出库失败')
    }
  } catch (error) {
    console.error('出库失败:', error)
    ElMessage.error('出库失败')
  }
}

// 查看详情
const viewDetail = (record) => {
  detailData.value = { ...record }
  showDetailDialog.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(outboundForm, {
    productId: '',
    outboundType: '',
    quantity: 1,
    retailPrice: 0,
    outboundDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  if (outboundFormRef.value) {
    outboundFormRef.value.clearValidate()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getOutboundRecords()
  getProductOptions()
})
</script>

<style scoped>
.outbound-container {
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

.stock-info {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>