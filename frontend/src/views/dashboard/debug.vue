<template>
  <div class="dashboard">
    <h1>仪表板调试版本</h1>
    
    <!-- 调试信息 -->
    <div class="debug-info">
      <h3>调试信息</h3>
      <p>API基础URL: {{ apiBaseUrl }}</p>
      <p>加载状态: {{ loading ? '加载中...' : '已完成' }}</p>
      <p>错误信息: {{ error || '无' }}</p>
      <p>最后更新: {{ lastUpdate }}</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon products">
              <el-icon size="40"><Goods /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.totalProducts }}</div>
              <div class="stats-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon suppliers">
              <el-icon size="40"><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.totalSuppliers }}</div>
              <div class="stats-label">供应商数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon low-stock">
              <el-icon size="40"><Warning /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.lowStockProducts }}</div>
              <div class="stats-label">库存预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon out-stock">
              <el-icon size="40"><CircleClose /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.outOfStockProducts }}</div>
              <div class="stats-label">缺货商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <el-row :gutter="20" class="actions-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>调试操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="loadStats">
              <el-icon><Refresh /></el-icon>
              重新加载数据
            </el-button>
            <el-button type="info" @click="testApi">
              <el-icon><Connection /></el-icon>
              测试API连接
            </el-button>
            <el-button type="warning" @click="clearData">
              <el-icon><Delete /></el-icon>
              清除数据
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- API响应日志 -->
    <el-row :gutter="20" class="logs-row" v-if="apiLogs.length > 0">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>API调用日志</span>
            <el-button type="text" @click="clearLogs" style="float: right;">清除日志</el-button>
          </template>
          <div class="api-logs">
            <div v-for="(log, index) in apiLogs" :key="index" 
                 :class="['log-entry', log.type]">
              <div class="log-header">
                <span class="log-time">{{ log.timestamp }}</span>
                <span class="log-type">{{ log.type.toUpperCase() }}</span>
              </div>
              <div class="log-message">{{ log.message }}</div>
              <pre v-if="log.data" class="log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Goods,
  User,
  Warning,
  CircleClose,
  Refresh,
  Connection,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import http from '@/config/http'
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api'

// 响应式数据
const loading = ref(false)
const error = ref('')
const lastUpdate = ref('')
const apiBaseUrl = ref(API_BASE_URL)
const apiLogs = ref([])

// 统计数据
const stats = ref({
  totalProducts: 0,
  totalSuppliers: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0
})

// 添加日志
function addLog(message, data = null, type = 'info') {
  apiLogs.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    message,
    data,
    type
  })
  
  // 限制日志数量
  if (apiLogs.value.length > 20) {
    apiLogs.value = apiLogs.value.slice(0, 20)
  }
}

// 清除日志
function clearLogs() {
  apiLogs.value = []
}

// 清除数据
function clearData() {
  stats.value = {
    totalProducts: 0,
    totalSuppliers: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  }
  error.value = ''
  lastUpdate.value = ''
  ElMessage.success('数据已清除')
}

// 测试API连接
async function testApi() {
  addLog('开始测试API连接')
  
  try {
    const response = await fetch(`${API_BASE_URL}/reports/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    addLog('API连接测试成功', data, 'success')
    ElMessage.success('API连接正常')
  } catch (err) {
    addLog('API连接测试失败', { error: err.message }, 'error')
    ElMessage.error(`API连接失败: ${err.message}`)
  }
}

// 加载统计数据
const loadStats = async () => {
  loading.value = true
  error.value = ''
  
  try {
    addLog('开始加载统计数据')
    
    // 重置统计数据
    stats.value = {
      totalProducts: 0,
      totalSuppliers: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0
    }

    // 获取统计数据
    try {
      addLog(`请求统计数据: ${API_BASE_URL}${API_ENDPOINTS.REPORTS.STATS}`)
      const statsResponse = await http.get(API_ENDPOINTS.REPORTS.STATS)
      addLog('统计数据响应', statsResponse, 'success')
      
      if (statsResponse && statsResponse.success) {
        stats.value.totalProducts = statsResponse.data.totalProducts || 0
        stats.value.lowStockProducts = statsResponse.data.lowStockProducts || 0
        addLog('统计数据处理成功', {
          totalProducts: stats.value.totalProducts,
          lowStockProducts: stats.value.lowStockProducts
        }, 'success')
      } else {
        addLog('统计数据格式错误', statsResponse, 'error')
      }
    } catch (err) {
      addLog('统计数据获取失败', { error: err.message }, 'error')
      console.error('获取统计数据失败:', err)
    }

    // 获取供应商数据
    try {
      addLog(`请求供应商数据: ${API_BASE_URL}${API_ENDPOINTS.SUPPLIERS.LIST}`)
      const suppliersResponse = await http.get(API_ENDPOINTS.SUPPLIERS.LIST)
      addLog('供应商数据响应', suppliersResponse, 'success')
      
      if (suppliersResponse && suppliersResponse.success) {
        stats.value.totalSuppliers = suppliersResponse.data.length || 0
        addLog('供应商数据处理成功', {
          totalSuppliers: stats.value.totalSuppliers
        }, 'success')
      } else {
        addLog('供应商数据格式错误', suppliersResponse, 'error')
      }
    } catch (err) {
      addLog('供应商数据获取失败', { error: err.message }, 'error')
      console.error('获取供应商数据失败:', err)
    }

    lastUpdate.value = new Date().toLocaleTimeString()
    addLog('数据加载完成', stats.value, 'success')
    ElMessage.success('数据加载完成')

  } catch (err) {
    error.value = err.message
    addLog('数据加载失败', { error: err.message }, 'error')
    console.error('加载统计数据失败:', err)
    ElMessage.error(`数据加载失败: ${err.message}`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  addLog('组件已挂载，开始初始化')
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.debug-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}

.debug-info h3 {
  margin-top: 0;
  color: #495057;
}

.debug-info p {
  margin: 5px 0;
  color: #6c757d;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 120px;
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: white;
}

.stats-icon.products {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.suppliers {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.low-stock {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.stats-icon.out-stock {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stats-info {
  flex: 1;
}

.stats-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.actions-row {
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  gap: 15px;
}

.logs-row {
  margin-bottom: 20px;
}

.api-logs {
  max-height: 400px;
  overflow-y: auto;
}

.log-entry {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border-left: 4px solid #ddd;
}

.log-entry.success {
  background: #f0f9ff;
  border-left-color: #10b981;
}

.log-entry.error {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.log-entry.info {
  background: #f8fafc;
  border-left-color: #6b7280;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.log-time {
  font-size: 12px;
  color: #6b7280;
}

.log-type {
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  background: #e5e7eb;
  color: #374151;
}

.log-message {
  font-weight: 500;
  margin-bottom: 5px;
}

.log-data {
  background: #f3f4f6;
  padding: 8px;
  border-radius: 3px;
  font-size: 12px;
  margin: 0;
  white-space: pre-wrap;
  overflow-x: auto;
}
</style>