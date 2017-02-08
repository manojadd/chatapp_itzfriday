var mongoose = require('mongoose');
var Channelmodel = require('./model/channel.schema.js');
var ChatHistorymodel = require('./model/chathistory.schema.js');
var db = require('./dbconnect.js'); //creating a connection to mongodb
var client = require('./RedisClient');
var pushToRedis = require('./PushToRedis');

module.exports = function(io, socket) {
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



    function handleMessage(channel, message) { //message is text version of the message object.
        message = JSON.parse(message);
        console.log(message, "in handlemessage");
        socket.emit('takeMessage', message);
    }

    function handleSubscribe(channel, count) { //count is the total number channels user is subscribed to.
        //currently this is empty.
    }

    function handleUnsubscribe(channel, count) { //count is the number of remaining subscriptions.
        console.log('User ' + socket.id + " has unsubscribed");
        pub.publish('channel1', `User with socket id: ${socket.id} has unsubscribed`);
    }
    // FIXME: rewrite without using io
    function handleSendMessage(sender, channelID, msg, timestamp) { //it will publish to the given channel and put it in database.FIXME:see 50 limit has reached
        obj = { 'from': sender, 'msg': msg, 'sendTime': timestamp } //-and if reached put it to mongoDB. Better write this function again.
        console.log("Message sent", obj);
        pub.publish(channelID, JSON.stringify(obj));
        pushToRedis(channelID, obj);
        //client.hincrby(sender + "/unreadNotifications", channelID, 1);
    }

    function handleTyping(name) { //emit the typing event to all connected users.
        io.emit('typing', name);
    }

    function handleDisconnect(socket) {
        console.log('a user disconnected');
    }

    function handlegetUnreadNotification(msg) { //FIXME: Write again.
        console.log('inside unreadNotifications', msg.user);
        client.hgetall(msg.user + "/unreadNotifications", function(err, reply) {
            socket.emit('unreadNotification', reply);
            console.log(reply);
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


        // if (msg.pageNo === 1) {
        //     getRedisHistory(msg);
        // } else {
        //     if (p_empty) {
        //         getMongoHistory(msg);
        //     } else {
        //         msg.pageNo = msg.pageNo - 1;
        //         getMongoHistory(msg);
        //     }
        // }
    }

    function handlegetUnreadNotification(msg) {
        client.hgetall(`${msg.user}/unreadNotifications`, function(err, value) {
            console.log(`unreadNotifications for manoj is: `, value);
            socket.emit('unreadNotification', value);
        });
    }

    function handleResetNotification(msg) {
        console.log("inside reset Notification", msg.user, msg.key);
        client.hset(msg.user + "/unreadNotifications", msg.key, "0");
        client.hgetall(msg.user + "/unreadNotifications", function(err, reply) {
            socket.emit('resetNotification', reply);
            //console.log(reply);
        });
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
        client.lrange("bob#general", 0, -1, function(err, reply) {
            if (reply == "") {

                socket.emit('pempty', "initial_secondary");

            } else {
                console.log(reply);
                let messages = reply.map((element, i) => {
                    return JSON.parse(element);
                });
                console.log(messages);
                socket.emit('chatHistory', messages, "initial_secondary");
            }
        });
    }

    sub.subscribe('bob#general');
}
