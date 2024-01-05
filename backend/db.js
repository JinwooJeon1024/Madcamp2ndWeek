const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/myDatabase';  // 데이터베이스 URI

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    // 실패 시 프로세스 종료
    process.exit(1);
  }
}

module.exports = connectDB;
