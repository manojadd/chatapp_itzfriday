const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

let User = require('./userchannellist.schema.js');
let LAT = require('./lat.schema.js');

// for (var i = 1; i <= 10; i++) {
//    user = new User({
//     username : 'user'+i ,
//     channelList : ['bob#general', 'bob#dev', 'itzfriday#UI']
//   });
//   user.save(function(err, reply){

//   });
// }

for (var i = 1; i <= 10; i++) {
  let lat = new LAT({
    username : 'user'+i ,
    lat : {
      'bob#general' :new Date(),
      'bob#dev':new Date(),
      'itzfriday#UI':new Date()}
  });
  // user.save(function(err, reply){});
  lat.save(function(err, reply){
    console.log('lat saved');
  });
}