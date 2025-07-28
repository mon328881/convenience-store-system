// API 配置
const isDevelopment = import.meta?.env?.DEV ?? true  // 默认为开发环境
const isProduction = import.meta?.env?.PROD ?? false

// 根据环境设置 API 基础地址
export const API_BASE_URL = (() => {
  // 生产环境：使用环境变量中的API地址
  if (isProduction && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // 开发环境：使用代理
  if (isDevelopment) {
    return '/api'
  }
  
  // 默认回退（用于Render等平台）
  return window.location.origin + '/api'
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
    BATCH_DELETE: '/suppliers/batch'
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
    STATS: '/reports/stats',
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