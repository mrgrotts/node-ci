const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => new User({}).save();

// '5aaf531109a60d61d4b076bc'
