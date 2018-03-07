var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");

var userSchema = mongoose.Schema({
  fullname: { type: String, required: [true, "User name is required!"] },
  email: { type: String, required: [true, "Email is required!"], unique: true },
  password: { type: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  picture: { type: String },
  username: { type: String, required: [true, "Link is required!"], unique: true },
  createdAt: { type: Date, default: Date.now }
});
userSchema.pre("save", hashPassword);
userSchema.pre("findOneAndUpdate", function hashPassword(next) {
  console.log(this._update);
  var user = this._update;
  if (!user.newPassword) {
    delete user.password;
    return next();
  } else {
    user.password = bcrypt.hashSync(user.newPassword);
    return next();
  }
});

userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};
userSchema.methods.hash = function (password) {
  return bcrypt.hashSync(password);
};
var User = mongoose.model('user', userSchema);

module.exports = User;

function hashPassword(next) {
  var user = this;
  if (!user.isModified("password")) {
    return next();
  } else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
}
