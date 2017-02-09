var mongoose = require('mongoose');

var ChatHistorymodel = require('./../model/chathistory.schema.js');
var db = require('./../connections/dbconnect.js'); //creating a connection to mongodb
let client = require('./../connections/redisclient.js');
var pushToRedis = require('./../PushToRedis');
let async = require('async');
let UserChannelList = require('./../model/userchannellist.schema.js');
let latList = require('./../model/lat.schema.js'),
userchannellist = new UserChannelList();

let unreadCount = {};

module.exports = function(io, socket)
{

  const sub = client.duplicate(); //subscriber for will subscribe to all channels he is member of
  const pub = client.duplicate(); //only one publisher is enough

  //Below are the redis events that are catched.
  sub.on('message', handleMessage);
  sub.on('subscribe', handleSubscribe);
  sub.on('unsubscribe', handleUnsubscribe);

  //Below are the event handlers for socket events
  socket.on('send message', handleSendMessage); //handling message sent from user.
  socket.on('typing', handleTyping); //handling typing event from user.
  socket.on('disconnect', handleDisconnect); //handling disconnecting event from user.
  socket.on('getUnreadNotification', handlegetUnreadNotification); //request for unreadnotifications for a user.
  socket.on('receiveChatHistory', handleReceiveChatHistory); //request for sending chat history by user. FIXME:put new function from 6th sprint
  socket.on('getResetNotification', handleResetNotification); //request for resetting chat history. FIXMEput new function from 6th sprint.
  socket.on('joinRoom',handleJoinRoom);


  function handleMessage(channel, message) { //message is text version of the message object.
    message = JSON.parse(message);
    socket.emit('takeMessage',channel,message);
  }

  function handleSubscribe(channel, count) { //count is the total number channels user is subscribed to.
    //currently this is empty.
  }

  function handleUnsubscribe(channel, count) { //count is the number of remaining subscriptions.
    pub.publish('channel1', `User with socket id: ${socket.id} has unsubscribed`);
  }
  // FIXME: rewrite without using io
  function handleSendMessage(sender, channelID, msg) { //it will publish to the given channel and put it in database.FIXME:see 50 limit has reached
    let date = new Date();
    obj = { 'sender': sender, 'msg': msg, 'TimeStamp': date} //-and if reached put it to mongoDB. Better write this function again.
    pub.publish(channelID, JSON.stringify(obj));
    pushToRedis(channelID, obj);
  }

  function handleTyping(name,channelId) { //emit the typing event to all connected users.
    pub.publish(channelId,JSON.stringify({"typer":name}));
  }

  function handleDisconnect(socket) {
  }

  function handlegetUnreadNotification(msg) { //FIXME: Write again.
    client.hgetall(msg.user + "/unreadNotifications", function(err, reply) {
      socket.emit('unreadNotification', reply);
    });
  }

  function handleReceiveChatHistory(msg) {
    if (msg.pageNo === "initial_primary") {
      getRedisHistory(msg);
    } else if (msg.pageNo === "initial_secondary") {
      getMongoHistory(msg);
    } else {
      getMongoHistory(msg);
    }

  }

  function handlegetUnreadNotification(msg) {
    client.hgetall(`${msg.user}/unreadNotifications`, function(err, value) {
      socket.emit('unreadNotification', value);
    });
  }

  function handleResetNotification(msg) {
    client.hset(msg.user + "/unreadNotifications", msg.key, "0");
    client.hgetall(msg.user + "/unreadNotifications", function(err, reply) {
      socket.emit('resetNotification', reply);
    });
  }

  function handleJoinRoom(msg){ //message has the name of room to join
    socket.join(msg);
  }

  function getMongoHistory(msg) {

    if (msg.pageNo === "initial_secondary") {
      ChatHistorymodel.find({}).sort({ _id: -1 }).limit(1).exec((err, reply) => {
        if (reply.length === 0) {
          socket.emit('historyEmpty');
        } else {
          socket.emit('chatHistory', reply[0].msgs, reply[0]._id);
        }
      });

    } else {
      ChatHistorymodel.find({ _id: msg.pageNo }, function(err, reply) {
        if (reply[0].p_page === null) {
          socket.emit('historyEmpty');
        } else {
          ChatHistorymodel.find({ _id: reply[0].p_page }, function(err, reply) {
            socket.emit('chatHistory', reply[0].msgs, reply[0]._id);
          });
        }
      });
    }
  }

  function getRedisHistory(msg) {
    client.lrange(msg.channelName, 0, -1, function(err, reply) {
      if (reply == "") {

        socket.emit('pempty', "initial_secondary");

      } else {
        let messages = reply.map((element, i) => {
          return JSON.parse(element);
        });
        socket.emit('chatHistory', messages, "initial_secondary");
      }
    });
  }

  socket.on('login', function(usrname) {
    let lat = null;
    let loginTime = new Date().getTime();
    latList.find({ username: usrname }, function(err, res) {
      lat = res[0].lat;
    })
    //search the DB for username
    UserChannelList.findOne({ username: usrname }, function(err, reply) {

      async.each(reply.channelList, function(item, callback) {
        sub.subscribe(item);
        let a = item;
        client.lrange(item, 0, -1, function(err, res) {
          let count = 0;
          res.forEach(function(item, i) {
            item = JSON.parse(item);
            if (new Date(item.TimeStamp).getTime() > new Date(lat[a]).getTime()) {
              count++;
            }
          });

          unreadCount[a] = count;
          callback();

        });
      }, function(err) {
        socket.emit('channelList', reply.channelList, unreadCount, lat);
      });

    });
  });

  socket.on('currentChannel', function(currentChannel, prevChannel, userName) {
    let d = new Date();
    unreadCount[prevChannel] = 0;
    unreadCount[currentChannel] = 0;
    let prev = 'lat.' + prevChannel;
    let current = 'lat.' + currentChannel;
    let obj = {};
    obj[prev] = new Date();
    obj[current] = new Date();
    latList.findOneAndUpdate({ username: userName }, { $set: obj }, function(err, reply) {
    });
    socket.emit("updateUnread", currentChannel, prevChannel, d);
  });
}
