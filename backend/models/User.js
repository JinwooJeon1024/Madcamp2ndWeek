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
  }
}, { collection: 'accounts'});

module.exports = mongoose.model('User', UserSchema);
