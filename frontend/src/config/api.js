// API 配置
const isDevelopment = import.meta?.env?.DEV ?? true  // 默认为开发环境
const isProduction = import.meta?.env?.PROD ?? false

// 部署方案配置
const DEPLOYMENT_TYPE = import.meta.env.VITE_DEPLOYMENT_TYPE || 'vercel' // 'vercel', 'local'

// 根据环境和部署方案设置 API 基础地址
export const API_BASE_URL = (() => {
  // 生产环境且配置为直连Supabase
  if (isProduction && DEPLOYMENT_TYPE === 'vercel' && import.meta.env.VITE_API_BASE_URL === 'direct-supabase') {
    // 在直连模式下，我们不应该有API基础地址，因为我们会直接使用Supabase客户端。
    // 返回一个特殊值或空字符串来表示这一点。
    return 'direct-supabase';
  }

  // 开发环境，使用Vite代理
  if (isDevelopment) {
    return '/api';
  }

  // 其他生产环境（如果未来有部署后端API的情况）
  if (isProduction) {
    // Vercel部署，但有后端API
    if (DEPLOYMENT_TYPE === 'vercel' && import.meta.env.VITE_VERCEL_API_URL) {
      return import.meta.env.VITE_VERCEL_API_URL + '/api';
    }
    // 默认回退到本地API地址（这在生产中通常不应该发生）
    return 'http://localhost:3000/api';
  }

  // 最终回退
  return '/api';
})();

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