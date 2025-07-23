// API 配置
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// 根据环境设置 API 基础地址
export const API_BASE_URL = isDevelopment 
  ? '/api'  // 开发环境使用代理
  : '/api'  // 生产环境使用相对路径

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
    SALES: '/reports/sales',
    INVENTORY: '/reports/inventory',
    PROFIT: '/reports/profit'
  }
}

export default {
  API_BASE_URL,
  API_ENDPOINTS
}