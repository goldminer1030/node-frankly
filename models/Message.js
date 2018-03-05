var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  username: { type: String },
  content: { type: String },
  createdAt: { type: Date, default: Date.now }
});

messageSchema.methods.getFormattedDate = function (date) {
  return date.getFullYear() + "-" + get2digits(date.getMonth() + 1) + "-" + get2digits(date.getDate());
};
messageSchema.methods.getFormattedTime = function (date) {
  return get2digits(date.getHours()) + ":" + get2digits(date.getMinutes()) + ":" + get2digits(date.getSeconds());
};
function get2digits(num) {
  return ("0" + num).slice(-2);
}

var Message = mongoose.model('message', messageSchema);

module.exports = Message;