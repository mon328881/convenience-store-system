import dayjs from 'dayjs'

// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

// 格式化日期时间
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

// 获取今天的日期
export const getToday = (format = 'YYYY-MM-DD') => {
  return dayjs().format(format)
}

// 获取当前时间
export const getNow = (format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs().format(format)
}

// 计算日期差
export const diffDays = (date1, date2) => {
  return dayjs(date1).diff(dayjs(date2), 'day')
}

// 添加天数
export const addDays = (date, days) => {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD')
}

// 减去天数
export const subtractDays = (date, days) => {
  return dayjs(date).subtract(days, 'day').format('YYYY-MM-DD')
}

// 判断是否是有效日期
export const isValidDate = (date) => {
  return dayjs(date).isValid()
}

// 获取月份的第一天
export const getFirstDayOfMonth = (date) => {
  return dayjs(date).startOf('month').format('YYYY-MM-DD')
}

// 获取月份的最后一天
export const getLastDayOfMonth = (date) => {
  return dayjs(date).endOf('month').format('YYYY-MM-DD')
}