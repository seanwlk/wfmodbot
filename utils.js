const assert = require('assert');
const { dbModels, rawQuery } = require("./db.js")

assert(process.env.DB_HOST, 'DB_HOST is missing');
assert(process.env.DB_PORT, 'DB_PORT is missing');
assert(process.env.DB_NAME, 'DB_NAME is missing');
assert(process.env.DB_USER, 'DB_USER is missing');
assert(process.env.DB_PWD, 'DB_PWD is missing');

module.exports.currentUnixTime = function() { return Math.round((new Date()).getTime() / 1000) }

module.exports.Unix_timestamp = function(t) {
  var a = new Date(t * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours() + (a.getTimezoneOffset() / 60);
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = `${date} ${month} ${year} ${hour}:${min}:${sec} UTC`;
  return time;
}

module.exports.secToHMS = function(seconds) {
  if (seconds < 0) return "Soon unmuted";
  if (isNaN(seconds)) return "forever";
  var days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  var hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  var minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports.sleeper = function(ms) {
  return function(x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

module.exports.queryAsync = rawQuery;