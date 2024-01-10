const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return this.type === 'local'; // type이 'local'일 때만 password 필수
    }
  },
  type: {
    type: String,
    required: true
  },
  profilePictureUrl: {
    type: String,
    default: "http://143.248.219.131:3000/images/default_profile.png"
  },
  rankingScore: {
    type: Number,
    default: 0 // 초기 점수 설정
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]

}, { collection: 'accounts'});

module.exports = mongoose.model('User', UserSchema);
