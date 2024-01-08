// server.js or app.js in Node.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User')
const app = express();
const cors = require('cors')
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(bodyParser.json());
app.use(cors())

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

const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected' + socket.id);

  socket.on('joinRoom', (data) => {  // 방 정보는 객체로 받음
    const room = data.room;
    socket.join(room);
    if(rooms[room]) {
      rooms[room]++;
    } else {
      rooms[room] = 1;
    }
    console.log(`User ${socket.id} joined room ${room}. Total users: ${rooms[room]}`);
  });
  socket.on('leaveRoom', (room) => {
      // 해당 방에서 참가자 제거
      socket.leave(room);

      // 방 정보 업데이트
      if (rooms[room]) {
          rooms[room]--;
          if (rooms[room] === 0) {
              delete rooms[room]; // 방의 참가자가 없을 경우 방 삭제
          }
      }

      console.log(`User ${socket.id} left room ${room}. Remaining users: ${rooms[room] || 0}`);
    });
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // 추가적인 방 참가자 관리 로직이 필요할 수 있음
    });
})

// 서버 시작
const PORT = 3000; // 포트 설정
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
