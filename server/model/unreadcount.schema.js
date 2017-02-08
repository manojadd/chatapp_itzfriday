const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
let unreadCountSchema = new Schema({
  username : String,
  unreadcount : {}
});
