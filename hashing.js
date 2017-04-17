var bcrypt = require('bcrypt');
var users = require('./users');

['password', 'Password', 'password1'].forEach(function(pw) {
  bcrypt.hash(pw, 10, function(err, hash) {
    console.log(`Was ${pw} - Now ${hash}`);
  });
});