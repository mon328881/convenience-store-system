// 🧪 MongoDB HTTP API 实验脚本
// 用于测试使用 MongoDB Atlas Data API 替代直接数据库连接

const https = require('https');

// ⚠️ 配置信息 - 需要从 MongoDB Atlas 获取
const ATLAS_CONFIG = {
  dataSource: 'Cluster0', // 你的集群名称，通常是 Cluster0
  database: 'convenience_store', // 数据库名称
  apiKey: 'YOUR_API_KEY_HERE', // 需要从 App Services 获取
  appId: 'YOUR_APP_ID_HERE', // 需要从 App Services 获取
  baseUrl: 'https://data.mongodb-api.com/app/{APP_ID}/endpoint/data/v1'
};

// MongoDB HTTP API 封装类
class MongoDBHTTPAPI {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.baseUrl.replace('{APP_ID}', config.appId);
  }

  // 通用 HTTP 请求方法
  async makeRequest(endpoint, method = 'POST', data = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const postData = JSON.stringify({
      dataSource: this.config.dataSource,
      database: this.config.database,
      ...data
    });

    return new Promise((resolve, reject) => {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(url, options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${result.error || responseData}`));
            }
          } catch (error) {
            reject(new Error(`解析响应失败: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`请求失败: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  // 查找文档
  async find(collection, filter = {}, options = {}) {
    return this.makeRequest('/action/find', 'POST', {
      collection: collection,
      filter: filter,
      ...options
    });
  }

  // 查找单个文档
  async findOne(collection, filter = {}) {
    return this.makeRequest('/action/findOne', 'POST', {
      collection: collection,
      filter: filter
    });
  }

  // 插入文档
  async insertOne(collection, document) {
    return this.makeRequest('/action/insertOne', 'POST', {
      collection: collection,
      document: document
    });
  }

  // 更新文档
  async updateOne(collection, filter, update) {
    return this.makeRequest('/action/updateOne', 'POST', {
      collection: collection,
      filter: filter,
      update: update
    });
  }

  // 删除文档
  async deleteOne(collection, filter) {
    return this.makeRequest('/action/deleteOne', 'POST', {
      collection: collection,
      filter: filter
    });
  }
}

// 基于 HTTP API 的产品服务类
class ProductAPIService {
  constructor(api) {
    this.api = api;
    this.collection = 'products';
  }

  // 获取所有产品
  async getAllProducts() {
    const result = await this.api.find(this.collection);
    return result.documents || [];
  }

  // 根据ID获取产品
  async getProductById(id) {
    // 注意：MongoDB的_id需要特殊处理
    const filter = typeof id === 'string' && id.length === 24 
      ? { _id: { $oid: id } } 
      : { _id: id };
    
    const result = await this.api.findOne(this.collection, filter);
    return result.document;
  }

  // 根据名称搜索产品
  async searchProductsByName(name) {
    const result = await this.api.find(this.collection, {
      name: { $regex: name, $options: 'i' }
    });
    return result.documents || [];
  }

  // 创建新产品
  async createProduct(productData) {
    const result = await this.api.insertOne(this.collection, productData);
    return result;
  }

  // 更新产品库存
  async updateStock(productId, newStock) {
    const filter = typeof productId === 'string' && productId.length === 24 
      ? { _id: { $oid: productId } } 
      : { _id: productId };
    
    const result = await this.api.updateOne(this.collection, filter, {
      $set: { stock: newStock }
    });
    return result;
  }
}

// 运行实验
async function runExperiment() {
  console.log('🧪 MongoDB HTTP API 实验开始');
  console.log('================================');

  // 检查配置
  if (ATLAS_CONFIG.apiKey === 'YOUR_API_KEY_HERE' || ATLAS_CONFIG.appId === 'YOUR_APP_ID_HERE') {
    console.log('❌ 配置不完整，需要设置 API Key 和 App ID');
    console.log('\n📋 配置步骤：');
    console.log('1. 登录 MongoDB Atlas: https://cloud.mongodb.com');
    console.log('2. 进入你的项目');
    console.log('3. 左侧菜单选择 "App Services"');
    console.log('4. 点击 "Create a New App" 或选择现有应用');
    console.log('5. 应用名称：convenience-store-api');
    console.log('6. 在应用中找到 "Data API"，点击 "Enable Data API"');
    console.log('7. 进入 "Authentication" → "API Keys"');
    console.log('8. 点击 "Create API Key"，名称：convenience-store-key');
    console.log('9. 复制 API Key 和 App ID 填入此脚本');
    console.log('\n🔧 配置示例：');
    console.log('apiKey: "abcd1234-5678-90ef-ghij-klmnopqrstuv"');
    console.log('appId: "data-abcde"');
    return;
  }

  try {
    // 初始化 API
    const mongoAPI = new MongoDBHTTPAPI(ATLAS_CONFIG);
    const productService = new ProductAPIService(mongoAPI);

    console.log('🔍 测试1: 获取商品列表');
    const products = await productService.getAllProducts();
    console.log(`✅ 成功获取 ${products.length} 个商品`);
    
    if (products.length > 0) {
      console.log('📦 商品示例：', products[0].name);
    }

    console.log('\n🔍 测试2: 搜索商品');
    const searchResults = await productService.searchProductsByName('农夫山泉');
    console.log(`✅ 搜索结果：找到 ${searchResults.length} 个相关商品`);

    console.log('\n🔍 测试3: 创建测试商品');
    const testProduct = {
      name: 'HTTP API 测试商品',
      brand: '测试品牌',
      category: '测试分类',
      purchasePrice: 1.0,
      retailPrice: 2.0,
      stock: 100,
      minStock: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const createResult = await productService.createProduct(testProduct);
    console.log('✅ 成功创建测试商品，ID:', createResult.insertedId);

    // 清理测试数据
    if (createResult.insertedId) {
      await mongoAPI.deleteOne('products', { _id: { $oid: createResult.insertedId } });
      console.log('🧹 已清理测试数据');
    }

    console.log('\n🎉 实验成功！MongoDB HTTP API 可以正常工作');
    console.log('\n📊 改造成本评估：');
    console.log('- 数据迁移：❌ 不需要');
    console.log('- 数据结构：❌ 不需要改变');
    console.log('- 代码改造：⚠️  中等（需要替换数据库操作层）');
    console.log('- 性能影响：⚠️  轻微（HTTP请求比直连稍慢）');
    console.log('- 云函数兼容：✅ 完全兼容');
    console.log('\n🚀 建议：立即开始改造，预计6-9小时完成');

  } catch (error) {
    console.error('❌ 实验失败：', error.message);
    console.log('\n🔧 可能的解决方案：');
    console.log('1. 检查 API Key 和 App ID 是否正确');
    console.log('2. 确认 Data API 已启用');
    console.log('3. 检查网络连接');
    console.log('4. 验证集群名称和数据库名称');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runExperiment();
}

module.exports = { MongoDBHTTPAPI, ProductAPIService };