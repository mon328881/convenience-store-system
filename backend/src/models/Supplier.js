const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '供应商名称不能为空'],
    trim: true,
    maxlength: [100, '供应商名称不能超过100个字符']
  },
  contact: {
    type: String,
    required: [true, '联系人不能为空'],
    trim: true,
    maxlength: [50, '联系人姓名不能超过50个字符']
  },
  phone: {
    type: String,
    required: [true, '联系电话不能为空'],
    trim: true,
    match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
  },
  products: [{
    type: String,
    trim: true
  }],
  paymentMethod: {
    type: String,
    required: [true, '付款方式不能为空'],
    enum: ['现金', '转账', '月结', '其他']
  },
  hasInvoice: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, '地址不能超过200个字符']
  },
  remark: {
    type: String,
    trim: true,
    maxlength: [500, '备注不能超过500个字符']
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

// 创建索引
supplierSchema.index({ name: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Supplier', supplierSchema);