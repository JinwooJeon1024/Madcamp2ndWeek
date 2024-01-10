const express = require('express');
const bodyParser = require('body-parser');
const User = require('./models/User');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const setupSocketHandlers = require('./sockets/socketHandlers');
const { mongoDB } = require("./config/db");
const multer = require('multer');
const path = require('path');

// const authRouts = require('./routes/authRouts');

app.use(bodyParser.json());
app.use(cors());
mongoDB();
setupSocketHandlers(io);




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // 이미지를 저장할 폴더
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // 파일명 설정
  }
});

const upload = multer({ storage: storage });
app.post('/profile', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const uid = req.body.uid; // 클라이언트에서 전송된 UID
  const imageUrl = `http://143.248.219.131:3000/uploads/${req.file.filename}`;

  try {
    // UID를 사용하여 사용자 찾기 및 프로필 이미지 URL 업데이트
    const user = await User.findOneAndUpdate({ uid: uid }, { profilePictureUrl: imageUrl }, { new: true });

    if (!user) {
      return res.status(404).send('User not found.');
    }

    // 클라이언트에 이미지 URL 응답
    res.json({ imageUrl: imageUrl });
  } catch (error) {
    res.status(500).send('Server error');
  }
});


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

app.use('/images', express.static('public/images'));
app.use('/uploads', express.static('uploads/'));

app.post('/mypage', async (req, res) => {
  const {uid} = req.body;
  try {
    const user = await User.findOne({ uid }); 
    if (user) {
      res.status(200).json({
        username: user.username,
        profilePictureUrl: user.profilePictureUrl // 프로필 사진 URL 추가
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/login', async (req, res) => {
  const { uid, password } = req.body;
  try {
    const user = await User.findOne({ uid }); 
    if (!user || !(password == user.password)) {
      res.status(401).json({ message: 'Invalid credentials' });
    } else {
      res.status(200).json({ message: 'Login successful', username: user.username });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/ranking', async (req, res) => {
  try {
    // 모든 사용자 데이터를 가져옵니다.
    const users = await User.find();
    // 사용자 데이터를 JSON 형식으로 응답합니다.
    console.log('get ranking');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
    res.send('Hello, World')
})

app.get('/ranking', async (req, res) => {
  try {
    // 모든 사용자 데이터를 가져옵니다.
    const users = await User.find();
    // 사용자 데이터를 JSON 형식으로 응답합니다.
    console.log('get ranking');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// 서버 시작
const PORT = 3000; // 포트 설정
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
