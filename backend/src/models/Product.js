const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '商品名称不能为空'],
    trim: true,
    maxlength: [100, '商品名称不能超过100个字符']
  },
  brand: {
    type: String,
    required: [true, '品牌不能为空'],
    trim: true,
    maxlength: [50, '品牌名称不能超过50个字符']
  },
  category: {
    type: String,
    required: [true, '商品分类不能为空'],
    trim: true
  },
  purchasePrice: {
    type: Number,
    required: [true, '采购价不能为空'],
    min: [0, '采购价不能为负数']
  },
  specification: {
    type: String,
    required: [true, '规格不能为空'],
    trim: true
  },
  retailPrice: {
    type: Number,
    required: [true, '零售价不能为空'],
    min: [0, '零售价不能为负数']
  },
  inputPrice: {
    type: Number,
    required: [true, '录入单价不能为空'],
    min: [0, '录入单价不能为负数']
  },
  image: {
    type: String,
    trim: true
  },
  relatedInfo: {
    type: String,
    trim: true,
    maxlength: [500, '关联信息不能超过500个字符']
  },
  totalInbound: {
    type: Number,
    default: 0,
    min: [0, '入库总量不能为负数']
  },
  totalOutbound: {
    type: Number,
    default: 0,
    min: [0, '出库总量不能为负数']
  },
  currentStock: {
    type: Number,
    default: 0,
    min: [0, '当前库存不能为负数']
  },
  stockAlert: {
    type: Number,
    min: [0, '库存预警值不能为负数']
  },
  unit: {
    type: String,
    default: '件',
    trim: true
  },
  barcode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
});

// 虚拟字段：是否库存不足
productSchema.virtual('isLowStock').get(function() {
  return this.stockAlert && this.currentStock <= this.stockAlert;
});

// 虚拟字段：毛利率
productSchema.virtual('profitMargin').get(function() {
  if (this.purchasePrice === 0) return 0;
  return ((this.retailPrice - this.purchasePrice) / this.purchasePrice * 100).toFixed(2);
});

// 创建索引
productSchema.index({ name: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ currentStock: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

// 更新库存的方法
productSchema.methods.updateStock = function(inboundQty = 0, outboundQty = 0) {
  this.totalInbound += inboundQty;
  this.totalOutbound += outboundQty;
  this.currentStock = this.totalInbound - this.totalOutbound;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);