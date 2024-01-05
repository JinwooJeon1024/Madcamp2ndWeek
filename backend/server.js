const express = require('express');
const connectDB = require('./db')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // User 모델을 불러옵니다. 경로는 실제 구조에 맞게 조정하세요.

const app = express();

app.use(express.json()); // JSON 요청 본문을 파싱하기 위해 사용합니다.

// 여기에 회원가입 및 로그인 라우트를 추가합니다. 예를 들어:

// 회원가입 라우트
app.post('/register', async (req, res) => {
  try {
    // 입력된 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // 새로운 사용자 생성
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    // 데이터베이스에 사용자 정보 저장
    const newUser = await user.save();
    res.status(201).send({ user: newUser._id }); // 성공적으로 생성됨
  } catch (error) {
    res.status(500).send(error); // 서버 에러
  }
});

// 로그인 라우트
app.post('/login', async (req, res) => {
  try {
    // 데이터베이스에서 사용자 찾기
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send('Cannot find user');
    }

    // 비밀번호 확인
    if (await bcrypt.compare(req.body.password, user.password)) {
      // JWT 토큰 생성
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      res.header('auth-token', token).send(token); // 토큰 전송
    } else {
      res.status(400).send('Invalid password');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/', (req, res) => {
  res.send('Hello Worl!');
});

connectDB()

// 서버 시작
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
