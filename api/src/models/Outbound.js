const mongoose = require('mongoose');

const outboundSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '商品不能为空']
  },
  quantity: {
    type: Number,
    required: [true, '出库数量不能为空'],
    min: [1, '出库数量必须大于0']
  },
  unitPrice: {
    type: Number,
    required: [true, '单价不能为空'],
    min: [0, '单价不能为负数']
  },
  totalAmount: {
    type: Number,
    required: [true, '总金额不能为空'],
    min: [0, '总金额不能为负数']
  },
  outboundDate: {
    type: Date,
    required: [true, '出库日期不能为空'],
    default: Date.now
  },
  outboundType: {
    type: String,
    required: [true, '出库类型不能为空'],
    enum: ['sale', 'return', 'damage', 'transfer', 'other'],
    default: 'sale'
  },
  customer: {
    type: String,
    trim: true,
    maxlength: [100, '客户名称不能超过100个字符']
  },
  batchNumber: {
    type: String,
    trim: true,
    maxlength: [50, '批次号不能超过50个字符']
  },
  remark: {
    type: String,
    trim: true,
    maxlength: [500, '备注不能超过500个字符']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
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

// 创建索引
outboundSchema.index({ product: 1 });
outboundSchema.index({ outboundDate: -1 });
outboundSchema.index({ outboundType: 1 });
outboundSchema.index({ status: 1 });
outboundSchema.index({ createdAt: -1 });

// 计算总金额的中间件
outboundSchema.pre('save', function(next) {
  this.totalAmount = this.quantity * this.unitPrice;
  next();
});

module.exports = mongoose.model('Outbound', outboundSchema);