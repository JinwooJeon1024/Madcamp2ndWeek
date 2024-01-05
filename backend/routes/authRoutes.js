const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 경로는 실제 구조에 맞게 조정하세요.

const router = express.Router();

// 회원가입 라우트
router.post('/register', async (req, res) => {
  // ... 회원가입 로직 ...
});

// 로그인 라우트
router.post('/login', async (req, res) => {
  // ... 로그인 로직 ...
});

module.exports = router;
