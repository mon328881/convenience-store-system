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
        <el-table-column prop="productName" label="商品名称" width="150" />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="quantity" label="入库数量" width="100" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="purchasePrice" label="采购单价" width="100">
          <template #default="scope">
            ¥{{ scope.row.purchasePrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="100">
          <template #default="scope">
            ¥{{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="supplierName" label="供应商" width="120" />
        <el-table-column prop="inboundDate" label="入库日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.inboundDate) }}
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
                  :key="product._id"
                  :label="`${product.name} - ${product.brand} (${product.specification})`"
                  :value="product._id"
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
              >
                <el-option
                  v-for="supplier in supplierOptions"
                  :key="supplier._id"
                  :label="supplier.name"
                  :value="supplier._id"
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
        <el-descriptions-item label="商品名称">{{ detailData.productName }}</el-descriptions-item>
        <el-descriptions-item label="品牌">{{ detailData.brand }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ detailData.specification }}</el-descriptions-item>
        <el-descriptions-item label="入库数量">{{ detailData.quantity }} {{ detailData.unit }}</el-descriptions-item>
        <el-descriptions-item label="采购单价">¥{{ detailData.purchasePrice?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ detailData.totalAmount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ detailData.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="入库日期">{{ formatDate(detailData.inboundDate) }}</el-descriptions-item>
        <el-descriptions-item label="操作员">{{ detailData.operator }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.notes || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
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
  total: 0
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
    { required: true, message: '请输入入库数量', trigger: 'blur' }
  ],
  purchasePrice: [
    { required: true, message: '请输入采购单价', trigger: 'blur' }
  ],
  inboundDate: [
    { required: true, message: '请选择入库日期', trigger: 'change' }
  ]
}

// 商品选项
const productOptions = ref([
  {
    _id: '1',
    name: '景田矿泉水',
    brand: '景田',
    specification: '550ml',
    unit: '瓶',
    purchasePrice: 1.5
  },
  {
    _id: '2',
    name: '百岁山矿泉水',
    brand: '百岁山',
    specification: '570ml',
    unit: '瓶',
    purchasePrice: 1.8
  }
])

// 供应商选项
const supplierOptions = ref([
  { _id: '1', name: '景田饮用水供应商' },
  { _id: '2', name: '百岁山水业' }
])

// 计算总金额
const totalAmount = computed(() => {
  return inboundForm.quantity * inboundForm.purchasePrice
})

// 获取入库记录
const getInboundRecords = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    inboundRecords.value = [
      {
        _id: '1',
        productName: '景田矿泉水',
        brand: '景田',
        specification: '550ml',
        quantity: 100,
        unit: '瓶',
        purchasePrice: 1.5,
        totalAmount: 150,
        supplierName: '景田饮用水供应商',
        inboundDate: new Date('2024-01-15'),
        operator: 'admin',
        notes: '首次进货'
      },
      {
        _id: '2',
        productName: '百岁山矿泉水',
        brand: '百岁山',
        specification: '570ml',
        quantity: 50,
        unit: '瓶',
        purchasePrice: 1.8,
        totalAmount: 90,
        supplierName: '百岁山水业',
        inboundDate: new Date('2024-01-20'),
        operator: 'admin',
        notes: '补充库存'
      }
    ]
    pagination.total = inboundRecords.value.length
  } catch (error) {
    ElMessage.error('获取入库记录失败')
  } finally {
    loading.value = false
  }
}

// 商品选择变化
const onProductChange = (productId) => {
  const product = productOptions.value.find(p => p._id === productId)
  if (product) {
    inboundForm.purchasePrice = product.purchasePrice
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
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('入库成功')
    showAddDialog.value = false
    resetForm()
    getInboundRecords()
  } catch (error) {
    console.error('表单验证失败:', error)
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
  if (inboundFormRef.value) {
    inboundFormRef.value.clearValidate()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getInboundRecords()
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