var express = require('express');
var router = express.Router();
var error = require('./../cfg/errorCode.ini');

var roomAPI = require('./../lib/room');


/**
 * filter 4 isloggedin
 */
router.get('/*',function(req,res, next) {
    if(!req.session.username) {
        req.session.originalUrl = req.originalUrl;
        res.redirect('/users/login');
    }
    else {
        next();
    }
});

/**
 * action /room?name=xxx
 */
router.get('/', function (req, res, next) {
    var roomname = req.query.name;
    var username = req.session.username;

    roomAPI.joinRoom(roomname,username, function(err) {
        if(err == error.ERROR) {
            res.redirect('/');
        }
        else {
            req.session.roomname = roomname;
            res.render('room/index',{
                title : 'room',
                name : roomname
            });
        }
    });
});

/**
 * action /room/list
 */
router.get('/list', function(req, res, next) {
    roomAPI.queryRooms(function(err, rooms) {
        if(err == error.ERROR) {
            res.write(JSON.stringify({result:false,data:[]}));
        }
        else {
            res.write(JSON.stringify({result:true,data:rooms}));
        }
        res.end();
    })
});
/**
 *  action /room/users?roomname=xx&tid=xxx
 */
router.get('/users', function(req, res, next) {
    var name = req.session.roomname,
        tid = req.query.tid;

    roomAPI.queryUsersByRoomNameWithTID(name, tid, function(err, _tid, users) {
        if(err == error.NOT_MODIFIED) {
            res.write(JSON.stringify({result:true,data:'not-modified',status:'not-modified', tid:_tid}));
        }
        else {
            res.write(JSON.stringify({result:true,data:users,status:'modified',tid:_tid}));
        }
        res.end();
    });
});
/**
 *  action /room/msg?roomname=xxx&tid=xxx
 */
router.get('/msg', function(req, res, next) {
    var roomname = req.session.roomname,
        tid = req.query.tid;

    roomAPI.queryLastestMsgByRoomName(roomname,tid,function(err, lastTag, msgs) {
        res.write(JSON.stringify({result:true, tid:lastTag, data:msgs || []}));
        res.end();
    });
});

/**
 *  action /room/send?msg=xxx
 */
router.get('/send',function(req, res, next) {
    var msg = req.query.msg;
    var username = req.session.username;
    var roomname = req.session.roomname;

    roomAPI.saveMsg(roomname, msg, username, function() {
        res.write(JSON.stringify({result:true}));
        res.end();
    });
});

/**
 *  action /room/create/name=xxx
 */
router.get('/create',function(req, res, next) {
    var roomname = req.query.name;

    roomAPI.createRoom(roomname, function (err, msg) {
        if(err == error.ERROR) {
            res.write(JSON.stringify({result:false,data:msg}));
        }
        else {
            res.write(JSON.stringify({result:true,data:''}));
        }
        res.end();
    })
});

module.exports = router;