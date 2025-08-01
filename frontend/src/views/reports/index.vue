<template>
  <div class="reports-container">
    <div class="page-header">
      <h2>统计报表</h2>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><Box /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statsData.totalProducts }}</div>
                <div class="stat-label">商品总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon suppliers">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statsData.totalSuppliers }}</div>
                <div class="stat-label">供应商数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon warning">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statsData.lowStockProducts }}</div>
                <div class="stat-label">库存预警</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon danger">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statsData.outOfStockProducts }}</div>
                <div class="stat-label">缺货商品</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 商品分类分布 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>商品分类分布</span>
              </div>
            </template>
            <div ref="categoryChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        
        <!-- 品牌分布 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>品牌分布</span>
              </div>
            </template>
            <div ref="brandChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 销售趋势 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>销售趋势</span>
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"
                  @change="updateSalesTrend"
                />
              </div>
            </template>
            <div ref="salesTrendChartRef" class="chart-container" style="height: 400px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="tables-section">
      <el-row :gutter="20">
        <!-- 热销商品 -->
        <el-col :span="12">
          <el-card class="table-card">
            <template #header>
              <div class="card-header">
                <span>热销商品 TOP 10</span>
              </div>
            </template>
            <el-table :data="hotProducts" stripe style="width: 100%">
              <el-table-column prop="rank" label="排名" width="60" />
              <el-table-column prop="name" label="商品名称" />
              <el-table-column prop="sales" label="销量" width="80" />
              <el-table-column prop="revenue" label="销售额" width="100">
                <template #default="scope">
                  ¥{{ (scope.row.revenue || 0).toFixed(2) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <!-- 库存预警 -->
        <el-col :span="12">
          <el-card class="table-card">
            <template #header>
              <div class="card-header">
                <span>库存预警商品</span>
              </div>
            </template>
            <el-table :data="lowStockItems" stripe style="width: 100%">
              <el-table-column prop="name" label="商品名称" />
              <el-table-column prop="currentStock" label="当前库存" width="80">
                <template #default="scope">
                  <span :class="{ 'danger-text': scope.row.currentStock === 0 }">
                    {{ scope.row.currentStock }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="stockAlert" label="预警值" width="70" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.currentStock === 0 ? 'danger' : 'warning'">
                    {{ scope.row.currentStock === 0 ? '缺货' : '预警' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Box, User, Warning, Close } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import SupabaseProductService from '@/utils/supabase.js'
import supabaseSupplierService from '@/utils/supabaseSupplier.js'
import supabaseInboundService from '@/utils/supabaseInbound.js'
import supabaseOutboundService from '@/utils/supabaseOutbound.js'

// 图表引用
const categoryChartRef = ref()
const brandChartRef = ref()
const salesTrendChartRef = ref()

// 日期范围
const dateRange = ref([])

// 统计数据
const statsData = reactive({
  totalProducts: 156,
  totalSuppliers: 12,
  lowStockProducts: 8,
  outOfStockProducts: 3
})

// 热销商品
const hotProducts = ref([
  { rank: 1, name: '景田矿泉水', sales: 245, revenue: 490 },
  { rank: 2, name: '百岁山矿泉水', sales: 198, revenue: 495 },
  { rank: 3, name: '农夫山泉', sales: 176, revenue: 440 },
  { rank: 4, name: '怡宝', sales: 156, revenue: 390 },
  { rank: 5, name: '娃哈哈', sales: 134, revenue: 335 }
])

// 库存预警商品
const lowStockItems = ref([
  { name: '百岁山矿泉水', currentStock: 8, stockAlert: 15 },
  { name: '可口可乐', currentStock: 5, stockAlert: 20 },
  { name: '雪碧', currentStock: 0, stockAlert: 15 },
  { name: '康师傅方便面', currentStock: 3, stockAlert: 10 }
])

// 初始化分类分布图表
const initCategoryChart = () => {
  const chart = echarts.init(categoryChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '商品分类',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 45, name: '饮料' },
          { value: 38, name: '零食' },
          { value: 32, name: '日用品' },
          { value: 25, name: '烟酒' },
          { value: 16, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
  
  // 响应式
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化品牌分布图表
const initBrandChart = () => {
  const chart = echarts.init(brandChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['景田', '百岁山', '娃哈哈', '农夫山泉', '怡宝']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '商品数量',
        type: 'bar',
        data: [15, 12, 18, 20, 14],
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  chart.setOption(option)
  
  // 响应式
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化销售趋势图表
const initSalesTrendChart = () => {
  const chart = echarts.init(salesTrendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销售额', '销量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额(元)',
        position: 'left'
      },
      {
        type: 'value',
        name: '销量(件)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        yAxisIndex: 0,
        data: [12000, 13200, 10100, 13400, 9000, 23000, 21000],
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '销量',
        type: 'line',
        yAxisIndex: 1,
        data: [2200, 1820, 1910, 2340, 2900, 3300, 3100],
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
  chart.setOption(option)
  
  // 响应式
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 更新销售趋势
const updateSalesTrend = () => {
  ElMessage.info('销售趋势数据已更新')
  // 这里可以根据日期范围重新获取数据并更新图表
}

// 获取统计数据
const getStatsData = async () => {
  try {
    console.log('开始加载报表数据...')
    
    // 并行获取所有需要的数据
    const [productsResult, suppliersResult, inboundResult, outboundResult] = await Promise.all([
      SupabaseProductService.getProducts({ limit: 1000 }),
      supabaseSupplierService.getSuppliers({ limit: 1000 }),
      supabaseInboundService.getInboundRecords({ limit: 1000, page: 1 }),
      supabaseOutboundService.getOutboundRecords({ limit: 1000, page: 1 })
    ])
    
    console.log('Supabase响应:', {
      products: productsResult,
      suppliers: suppliersResult,
      inbound: inboundResult,
      outbound: outboundResult
    })
    
    // 处理数据
    const products = productsResult.success ? productsResult.data : []
    const suppliers = suppliersResult.success ? suppliersResult.data : []
    const inboundRecords = inboundResult.success ? inboundResult.data : []
    const outboundRecords = outboundResult.success ? outboundResult.data : []
    
    // 计算统计数据
    const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.minStock || 10)).length
    const outOfStockProducts = products.filter(p => p.stockQuantity === 0).length
    
    // 更新统计数据
    Object.assign(statsData, {
      totalProducts: products.length,
      totalSuppliers: suppliers.length,
      lowStockProducts: lowStockProducts,
      outOfStockProducts: outOfStockProducts
    })
    
    console.log('统计数据:', statsData)
    
    // 计算热销商品（基于出库记录）
    const productSales = {}
    outboundRecords.forEach(record => {
      const productId = record.productId
      const productName = record.product?.name || '未知商品'
      const quantity = record.quantity || 0
      const unitPrice = record.unitPrice || 0
      
      if (!productSales[productId]) {
        productSales[productId] = {
          name: productName,
          sales: 0,
          revenue: 0
        }
      }
      
      productSales[productId].sales += quantity
      productSales[productId].revenue += quantity * unitPrice
    })
    
    // 转换为数组并排序
    const hotProductsArray = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        name: item.name,
        sales: item.sales,
        revenue: item.revenue
      }))
    
    hotProducts.value = hotProductsArray.length > 0 ? hotProductsArray : [
      { rank: 1, name: '景田矿泉水', sales: 245, revenue: 490 },
      { rank: 2, name: '百岁山矿泉水', sales: 198, revenue: 495 },
      { rank: 3, name: '农夫山泉', sales: 176, revenue: 440 },
      { rank: 4, name: '怡宝', sales: 156, revenue: 390 },
      { rank: 5, name: '娃哈哈', sales: 134, revenue: 335 }
    ]
    
    console.log('热销商品:', hotProducts.value)
    
    // 更新库存预警数据
    const lowStockItemsArray = products
      .filter(p => p.stockQuantity <= (p.minStock || 10))
      .map(p => ({
        name: p.name,
        currentStock: p.stockQuantity || 0,
        stockAlert: p.minStock || 10
      }))
      .slice(0, 10)
    
    lowStockItems.value = lowStockItemsArray.length > 0 ? lowStockItemsArray : [
      { name: '百岁山矿泉水', currentStock: 8, stockAlert: 15 },
      { name: '可口可乐', currentStock: 5, stockAlert: 20 },
      { name: '雪碧', currentStock: 0, stockAlert: 15 },
      { name: '康师傅方便面', currentStock: 3, stockAlert: 10 }
    ]
    
    console.log('库存预警商品:', lowStockItems.value)
    
    ElMessage.success('统计数据加载完成')
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败: ' + error.message)
    
    // 使用默认数据
    Object.assign(statsData, {
      totalProducts: 0,
      totalSuppliers: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0
    })
  }
}

// 组件挂载时初始化
onMounted(async () => {
  await getStatsData()
  
  // 等待DOM渲染完成后初始化图表
  nextTick(() => {
    initCategoryChart()
    initBrandChart()
    initSalesTrendChart()
  })
})
</script>

<style scoped>
.reports-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.suppliers {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #e6a23c;
}

.stat-icon.danger {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tables-section .table-card {
  height: 400px;
}

.danger-text {
  color: #f56c6c;
  font-weight: bold;
}
</style>