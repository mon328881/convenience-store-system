import axios from 'axios'
import { ElMessage } from 'element-plus'
import { API_BASE_URL } from './api'

// 创建 axios 实例
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('HTTP请求错误:', error)
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          // 可以在这里处理登录跳转
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      // 网络错误
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      // 其他错误
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default http