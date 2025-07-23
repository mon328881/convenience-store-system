const express = require('express');
const router = express.Router();

// 简单的认证中间件（暂时不实现完整的JWT认证）
const authMiddleware = (req, res, next) => {
  // 暂时跳过认证，直接设置用户信息
  req.user = { username: 'admin' };
  next();
};

// 登录接口（暂时返回成功）
router.post('/login', (req, res) => {
  res.json({
    success: true,
    message: '登录成功',
    data: {
      token: 'mock_token',
      user: {
        username: 'admin',
        role: 'admin'
      }
    }
  });
});

// 获取用户信息
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

module.exports = router;