<template>
  <div class="dashboard">
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

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>商品分类统计</span>
          </template>
          <div class="chart-container">
            <v-chart :option="categoryChartOption" style="height: 300px;" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>品牌分布</span>
          </template>
          <div class="chart-container">
            <v-chart :option="brandChartOption" style="height: 300px;" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="actions-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/products')">
              <el-icon><Plus /></el-icon>
              添加商品
            </el-button>
            <el-button type="success" @click="$router.push('/inventory/inbound')">
              <el-icon><Download /></el-icon>
              商品入库
            </el-button>
            <el-button type="warning" @click="$router.push('/inventory/outbound')">
              <el-icon><Upload /></el-icon>
              商品出库
            </el-button>
            <el-button type="info" @click="$router.push('/suppliers')">
              <el-icon><User /></el-icon>
              管理供应商
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近操作 -->
    <el-row :gutter="20" class="recent-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近入库</span>
          </template>
          <el-table :data="recentInbound" style="width: 100%" max-height="250">
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="createdAt" label="时间" width="120" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近出库</span>
          </template>
          <el-table :data="recentOutbound" style="width: 100%" max-height="250">
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="createdAt" label="时间" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  Goods,
  User,
  Warning,
  CircleClose,
  Plus,
  Download,
  Upload
} from '@element-plus/icons-vue'
import SupabaseProductService from '@/utils/supabase.js'
import supabaseSupplierService from '@/utils/supabaseSupplier.js'
import supabaseInboundService from '@/utils/supabaseInbound.js'
import supabaseOutboundService from '@/utils/supabaseOutbound.js'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 统计数据
const stats = ref({
  totalProducts: 0,
  totalSuppliers: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0
})

// 分类统计数据
const categoryStats = ref([])
const brandStats = ref([])

// 最近操作数据
const recentInbound = ref([])
const recentOutbound = ref([])

// 分类图表配置
const categoryChartOption = computed(() => ({
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
      data: categoryStats.value.map(item => ({
        value: item.count,
        name: item.id
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))

// 品牌图表配置
const brandChartOption = computed(() => ({
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
    data: brandStats.value.map(item => item.id)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '商品数量',
      type: 'bar',
      data: brandStats.value.map(item => item.count),
      itemStyle: {
        color: '#409EFF'
      }
    }
  ]
}))

// 加载统计数据
const loadStats = async () => {
  try {
    console.log('开始加载dashboard数据...')
    
    // 并行加载所有数据以提高性能
    const [
      productsResult,
      suppliersResult,
      categoryStatsData,
      brandStatsData,
      inboundResult,
      outboundResult
    ] = await Promise.all([
      SupabaseProductService.getProducts({ limit: 1000 }),
      supabaseSupplierService.getSuppliers({ limit: 1000 }),
      SupabaseProductService.getCategoryStats(),
      SupabaseProductService.getBrandStats(),
      supabaseInboundService.getInboundRecords({ limit: 5, page: 1 }),
      supabaseOutboundService.getOutboundRecords({ limit: 5, page: 1 })
    ])
    
    console.log('Supabase响应:', {
      products: productsResult,
      suppliers: suppliersResult,
      category: categoryStatsData,
      brand: brandStatsData,
      inbound: inboundResult,
      outbound: outboundResult
    })
    
    // 计算统计数据
    const products = productsResult.success ? productsResult.data : []
    const suppliers = suppliersResult.success ? suppliersResult.data : []
    
    const lowStockProducts = products.filter(p => p.currentStock <= (p.stockAlert || 10)).length
    const outOfStockProducts = products.filter(p => p.currentStock === 0).length
    
    // 设置统计数据
    stats.value = {
      totalProducts: products.length,
      totalSuppliers: suppliers.length,
      lowStockProducts,
      outOfStockProducts
    }
    console.log('统计数据加载成功:', stats.value)
    
    // 设置分类统计数据
    categoryStats.value = categoryStatsData.success ? categoryStatsData.data : []
    console.log('分类统计数据加载成功:', categoryStats.value)
    
    // 设置品牌统计数据
    brandStats.value = brandStatsData.success ? brandStatsData.data : []
    console.log('品牌统计数据加载成功:', brandStats.value)
    
    // 设置入库记录
    const inboundData = inboundResult.success ? inboundResult.data : []
    recentInbound.value = inboundData.map(item => ({
      productName: item.product?.name || '未知商品',
      quantity: item.quantity || 0,
      createdAt: new Date(item.createdAt).toLocaleDateString()
    }))
    console.log('入库记录加载成功:', recentInbound.value)
    
    // 设置出库记录
    const outboundData = outboundResult.success ? outboundResult.data : []
    recentOutbound.value = outboundData.map(item => ({
      productName: item.product?.name || '未知商品',
      quantity: item.quantity || 0,
      createdAt: new Date(item.createdAt).toLocaleDateString()
    }))
    console.log('出库记录加载成功:', recentOutbound.value)
    
    console.log('所有dashboard数据加载完成')
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 如果API调用失败，使用默认数据
    stats.value = {
      totalProducts: 0,
      totalSuppliers: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0
    }
    categoryStats.value = []
    brandStats.value = []
    recentInbound.value = []
    recentOutbound.value = []
  }
}

onMounted(() => {
  loadStats()
})
const loadDashboardData = async () => {
  // try {
  //   // 并行获取所有数据
  //   const [
  //     productsData,
  //     suppliersData,
  //     inboundData,
  //     outboundData
  //   ] = await Promise.all([
  //     SupabaseProductService.getProducts({ limit: 1000 }),
  //     supabaseSupplierService.getSuppliers({ limit: 1000 }),
  //     supabaseInboundService.getInbounds({ limit: 5, page: 1 }),
  //     supabaseOutboundService.getOutbounds({ limit: 5, page: 1 })
  //   ])

  //   // 更新商品统计
  //   if (productsData.success) {
  //     const products = productsData.data
  //     stats.value.totalProducts = products.length
  //     stats.value.lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock < p.stockAlert).length
  //     stats.value.outOfStockProducts = products.filter(p => p.currentStock === 0).length

  //     // 计算分类和品牌统计
  //     const categories = {}
  //     const brands = {}
  //     products.forEach(p => {
  //       categories[p.category] = (categories[p.category] || 0) + 1
  //       brands[p.brand] = (brands[p.brand] || 0) + 1
  //     })
  //     categoryStats.value = Object.entries(categories).map(([name, value]) => ({ name, value }))
  //     brandStats.value = Object.entries(brands).map(([name, value]) => ({ name, value }))
  //   }

  //   // 更新供应商统计
  //   if (suppliersData.success) {
  //     stats.value.totalSuppliers = suppliersData.data.length
  //   }

  //   // 更新最近入库
  //   if (inboundData.success) {
  //     recentInbound.value = inboundData.data.map(item => ({
  //       productName: item.product_name,
  //       quantity: item.quantity,
  //       createdAt: new Date(item.created_at).toLocaleDateString()
  //     }))
  //   }

  //   // 更新最近出库
  //   if (outboundData.success) {
  //     recentOutbound.value = outboundData.data.map(item => ({
  //       productName: item.product_name,
  //       quantity: item.quantity,
  //       createdAt: new Date(item.created_at).toLocaleDateString()
  //     }))
  //   }
  // } catch (error) {
  //   console.error('加载仪表盘数据失败:', error)
  // }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
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

.charts-row {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
}

.actions-row {
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  gap: 15px;
}

.recent-row {
  margin-bottom: 20px;
}
</style>