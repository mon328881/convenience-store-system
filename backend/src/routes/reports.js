const express = require('express');
const router = express.Router();

// 报表统计路由（暂时返回模拟数据）
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProducts: 156,
      totalSuppliers: 12,
      lowStockProducts: 8,
      outOfStockProducts: 3,
      categoryStats: [
        { _id: '饮料', count: 45 },
        { _id: '零食', count: 38 },
        { _id: '日用品', count: 32 },
        { _id: '烟酒', count: 25 },
        { _id: '其他', count: 16 }
      ],
      brandStats: [
        { _id: '景田', count: 15 },
        { _id: '百岁山', count: 12 },
        { _id: '娃哈哈', count: 18 },
        { _id: '农夫山泉', count: 20 },
        { _id: '怡宝', count: 14 }
      ]
    },
    message: '统计数据获取成功'
  });
});

module.exports = router;