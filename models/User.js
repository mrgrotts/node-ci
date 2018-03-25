const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: String,
  googleDisplayName: String
});

mongoose.model('User', userSchema);
