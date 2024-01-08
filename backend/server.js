const express = require('express');
const bodyParser = require('body-parser');
const User = require('./models/User');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const setupSocketHandlers = require('./sockets/socketHandlers');
const { mongoDB } = require("./config/db");
// const authRouts = require('./routes/authRouts');

app.use(bodyParser.json());
app.use(cors());
mongoDB();
setupSocketHandlers(io);

// '/register' 엔드포인트 정의
app.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    console.log(newUser)
    await newUser.save();
    console.log("hello")
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/login', async (req, res) => {
  const { uid, password } = req.body;
  try {
    const user = await User.findOne({ uid }); 
    if (!user || !(password == user.password)) {
      res.status(401).json({ message: 'Invalid credentials' });
    } else {
      res.status(200).json({ message: 'Login successful' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
    res.send('Hello, World')
})

// 서버 시작
const PORT = 3000; // 포트 설정
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
