const mongoose = require('mongoose');

const inboundSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '商品不能为空']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, '供应商不能为空']
  },
  quantity: {
    type: Number,
    required: [true, '入库数量不能为空'],
    min: [1, '入库数量必须大于0']
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
  inboundDate: {
    type: Date,
    required: [true, '入库日期不能为空'],
    default: Date.now
  },
  batchNumber: {
    type: String,
    trim: true,
    maxlength: [50, '批次号不能超过50个字符']
  },
  expiryDate: {
    type: Date
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
inboundSchema.index({ product: 1 });
inboundSchema.index({ supplier: 1 });
inboundSchema.index({ inboundDate: -1 });
inboundSchema.index({ status: 1 });
inboundSchema.index({ createdAt: -1 });

// 计算总金额的中间件
inboundSchema.pre('save', function(next) {
  this.totalAmount = this.quantity * this.unitPrice;
  next();
});

module.exports = mongoose.model('Inbound', inboundSchema);