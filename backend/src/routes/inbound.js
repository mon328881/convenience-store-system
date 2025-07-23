const express = require('express');
const router = express.Router();

// 入库管理路由（暂时返回模拟数据）
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: '入库管理功能开发中'
  });
});

module.exports = router;