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
        name: item._id
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
    data: brandStats.value.map(item => item._id)
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
    // 这里应该调用API获取真实数据
    // 暂时使用模拟数据
    stats.value = {
      totalProducts: 156,
      totalSuppliers: 12,
      lowStockProducts: 8,
      outOfStockProducts: 3
    }
    
    categoryStats.value = [
      { _id: '饮料', count: 45 },
      { _id: '零食', count: 38 },
      { _id: '日用品', count: 32 },
      { _id: '烟酒', count: 25 },
      { _id: '其他', count: 16 }
    ]
    
    brandStats.value = [
      { _id: '景田', count: 15 },
      { _id: '百岁山', count: 12 },
      { _id: '娃哈哈', count: 18 },
      { _id: '农夫山泉', count: 20 },
      { _id: '怡宝', count: 14 }
    ]
    
    recentInbound.value = [
      { productName: '景田百岁山 550ml', quantity: 50, createdAt: '2024-01-15' },
      { productName: '娃哈哈纯净水 500ml', quantity: 30, createdAt: '2024-01-14' },
      { productName: '农夫山泉 380ml', quantity: 40, createdAt: '2024-01-13' }
    ]
    
    recentOutbound.value = [
      { productName: '怡宝纯净水 550ml', quantity: 20, createdAt: '2024-01-15' },
      { productName: '景田百岁山 350ml', quantity: 15, createdAt: '2024-01-14' },
      { productName: '农夫山泉 500ml', quantity: 25, createdAt: '2024-01-13' }
    ]
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
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