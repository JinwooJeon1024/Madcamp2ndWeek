// server.js or app.js in Node.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User')

const app = express();

app.use(bodyParser.json());

// MongoDB와의 연결 설정이 이미 이루어졌다고 가정
// ...
const { mongoDB } = require("./config/db");
mongoDB()

// '/register' 엔드포인트 정의
app.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    console.log(newUser)
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/', (req, res) => {
    res.send('Hello, World')
})

// 서버 시작
const PORT = 3000; // 포트 설정
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
