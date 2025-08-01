# EdgeOne边缘函数测试脚本

## 本地测试

### 1. 安装依赖
```bash
cd edge-functions
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入您的MongoDB连接字符串
```

### 3. 本地运行测试
```bash
# 使用Node.js直接运行（需要适配）
node --experimental-modules index.js

# 或使用Cloudflare Wrangler（推荐）
npm install -g wrangler
wrangler dev --local
```

## API测试用例

### 健康检查
```bash
curl -X GET "https://your-domain.edgeone.app/api/health"
```

### 供应商管理
```bash
# 获取供应商列表
curl -X GET "https://your-domain.edgeone.app/api/suppliers?page=1&limit=10"

# 创建供应商
curl -X POST "https://your-domain.edgeone.app/api/suppliers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试供应商",
    "code": "SUP001",
    "contact": "张三",
    "phone": "13800138000",
    "email": "test@example.com",
    "address": "北京市朝阳区"
  }'
```

### 商品管理
```bash
# 获取商品列表
curl -X GET "https://your-domain.edgeone.app/api/products?page=1&limit=10"

# 创建商品（需要先有供应商ID）
curl -X POST "https://your-domain.edgeone.app/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试商品",
    "code": "PROD001",
    "category": "电子产品",
    "unit": "个",
    "purchasePrice": 100,
    "salePrice": 150,
    "stock": 50,
    "minStock": 10,
    "maxStock": 500,
    "supplierId": "供应商ID",
    "description": "这是一个测试商品"
  }'
```

### 入库管理
```bash
# 获取入库记录
curl -X GET "https://your-domain.edgeone.app/api/inbound?page=1&limit=10"

# 创建入库记录
curl -X POST "https://your-domain.edgeone.app/api/inbound" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "商品ID",
    "supplierId": "供应商ID",
    "quantity": 20,
    "unitPrice": 100,
    "inboundDate": "2024-01-01",
    "inboundType": "purchase",
    "status": "completed",
    "remark": "测试入库"
  }'
```

### 出库管理
```bash
# 获取出库记录
curl -X GET "https://your-domain.edgeone.app/api/outbound?page=1&limit=10"

# 创建出库记录
curl -X POST "https://your-domain.edgeone.app/api/outbound" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "商品ID",
    "quantity": 5,
    "unitPrice": 150,
    "outboundDate": "2024-01-01",
    "outboundType": "sale",
    "status": "completed",
    "remark": "测试出库"
  }'
```

### 报表数据
```bash
# 获取仪表板数据
curl -X GET "https://your-domain.edgeone.app/api/reports/dashboard"
```

## 性能测试

### 并发测试
```bash
# 使用Apache Bench进行并发测试
ab -n 1000 -c 10 https://your-domain.edgeone.app/api/health

# 使用curl进行简单压力测试
for i in {1..100}; do
  curl -s https://your-domain.edgeone.app/api/health > /dev/null &
done
wait
```

### 响应时间测试
```bash
# 测试API响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.edgeone.app/api/health
```

创建 `curl-format.txt` 文件：
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

## 错误测试

### 测试错误处理
```bash
# 测试不存在的接口
curl -X GET "https://your-domain.edgeone.app/api/nonexistent"

# 测试无效的JSON数据
curl -X POST "https://your-domain.edgeone.app/api/products" \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'

# 测试缺少必填字段
curl -X POST "https://your-domain.edgeone.app/api/suppliers" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 监控测试

### 日志检查
在EdgeOne控制台中查看：
1. 函数执行日志
2. 错误日志
3. 性能指标

### 健康监控
```bash
# 创建健康检查脚本
#!/bin/bash
while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.edgeone.app/api/health)
  if [ $response -eq 200 ]; then
    echo "$(date): 健康检查通过"
  else
    echo "$(date): 健康检查失败，状态码: $response"
  fi
  sleep 60
done
```

## 自动化测试

### 使用Jest进行单元测试
```javascript
// test/api.test.js
const request = require('supertest');

describe('API测试', () => {
  const baseURL = 'https://your-domain.edgeone.app';
  
  test('健康检查', async () => {
    const response = await request(baseURL)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });
  
  test('获取供应商列表', async () => {
    const response = await request(baseURL)
      .get('/api/suppliers')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### 运行测试
```bash
npm install --save-dev jest supertest
npm test
```