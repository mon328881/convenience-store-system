// API 配置
const isDevelopment = import.meta?.env?.DEV ?? true  // 默认为开发环境
const isProduction = import.meta?.env?.PROD ?? false

// 部署方案配置
const DEPLOYMENT_TYPE = import.meta.env.VITE_DEPLOYMENT_TYPE || 'edgeone' // 'edgeone', 'render', 'local'

// 根据环境和部署方案设置 API 基础地址
export const API_BASE_URL = (() => {
  // 开发环境：使用Vite代理
  if (isDevelopment) {
    // 使用Vite代理访问本地后端服务
    return '/api'
  }
  
  // 生产环境：根据部署方案选择API地址
  if (isProduction) {
    switch (DEPLOYMENT_TYPE) {
      case 'edgeone':
        // EdgeOne边缘函数部署
        return (import.meta.env.VITE_EDGEONE_API_URL || 'https://your-domain.edgeone.app') + '/api'
      
      case 'render':
        // Render平台部署
        return (import.meta.env.VITE_API_URL || window.location.origin) + '/api'
      
      case 'tencent':
        // 腾讯云轻量应用服务器部署
        return (import.meta.env.VITE_TENCENT_API_URL || 'https://your-server-ip') + '/api'
      
      default:
        // 默认回退
        return (import.meta.env.VITE_API_URL || window.location.origin) + '/api'
    }
  }
  
  // 默认回退：使用腾讯云函数地址
  return (import.meta.env.VITE_EDGEONE_API_URL || 'https://1371559131-0yd2evf4vy.ap-beijing.tencentscf.com') + '/api'
})()

// API 端点配置
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USER_INFO: '/auth/user'
  },
  
  // 供应商管理
  SUPPLIERS: {
    LIST: '/suppliers',
    CREATE: '/suppliers',
    UPDATE: (id) => `/suppliers/${id}`,
    DELETE: (id) => `/suppliers/${id}`,
    BATCH_DELETE: '/suppliers/batch',
    BY_PRODUCT: (productId) => `/suppliers/by-product/${productId}`
  },
  
  // 商品管理
  PRODUCTS: {
    LIST: '/products',
    STATS: '/products/stats',
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    GET: (id) => `/products/${id}`
  },
  
  // 入库管理
  INBOUND: {
    LIST: '/inbound',
    CREATE: '/inbound',
    UPDATE: (id) => `/inbound/${id}`,
    DELETE: (id) => `/inbound/${id}`
  },
  
  // 出库管理
  OUTBOUND: {
    LIST: '/outbound',
    CREATE: '/outbound',
    UPDATE: (id) => `/outbound/${id}`,
    DELETE: (id) => `/outbound/${id}`
  },
  
  // 报表统计
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    SUMMARY: '/reports/dashboard',  // 修改为实际可用的端点
    STATS: '/reports/dashboard',    // 为了兼容性，也指向dashboard
    CATEGORY_STATS: '/reports/category-stats',
    BRAND_STATS: '/reports/brand-stats',
    SALES: '/reports/sales',
    INVENTORY: '/reports/inventory',
    PROFIT: '/reports/profit'
  }
}

export default {
  API_BASE_URL,
  API_ENDPOINTS
}