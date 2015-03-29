var redis = require('redis');
var redisCfg = require('./../cfg/redisCfg.ini');
var error = require('./../cfg/errorCode.ini');

var client = redis.createClient(redisCfg.port,redisCfg.ip);

var key_roomUser = 'roomuser_',
    key_userRoom = 'userroom_',
    key_msg = 'msg_room_';

/**
 *  回调
 * @param callback
 * @param params
 */
function call_callback(callback, params) {
    if(typeof callback == 'function') {
        callback.apply(null, params);
    }
}

var roomAPI = {
    /**
     * 进入房间
     * @param roomname
     * @param username
     * @param {err:error.OK}callback
     */
    joinRoom : function(roomname, username,callback) {
        client.set('user_room_uuid', new Date().getTime());

        client.multi()
            .set(key_userRoom + username, roomname)
            .sadd(key_roomUser + roomname, username)
            .exec(function(err, replies) {
                if(err) {
                    call_callback(callback, [error.ERROR]);
                }
                else {
                    call_callback(callback, [error.OK]);
                }
            });
    },
    /**
     * 离开房间
     * @param roomname
     * @param username
     * @param callback
     */
    outRoom : function(roomname, username, callback) {
        client.srem(key_roomUser + roomname, username, function(err, reply) {
            client.set('user_room_uuid', new Date().getTime());
            call_callback(callback,[error.OK]);
        })
    },

    queryRooms : function(callback) {
        client.smembers('rooms',function(err, reply) {
            if(err) {
                call_callback(callback, [error.ERROR]);
            }
            else {
                call_callback(callback, [error.OK, reply]);
            }
        });
    },

    /**
     * 查询房间用户
     * @param roomname
     * @param callback
     */
    queryUsersByRoomName : function(roomname, callback) {
        client.smembers(key_roomUser+roomname,function(err, reply) {
            if(err) {
                call_callback(callback,[error.ERROR]);
            }
            else {
                call_callback(callback, [error.OK, reply]);
            }
        })
    },

    /**
     * 根据房间名查询用户，带TID
     * @param roomname
     * @param tid
     * @param callback
     */
    queryUsersByRoomNameWithTID : function(roomname, tid, callback) {
        client.get('user_room_uuid', function(err, s_tid) {
            if(tid == s_tid ) {
                call_callback(callback, [error.NOT_MODIFIED,s_tid]);
            }
            else {
                roomAPI.queryUsersByRoomName(roomname, function(err, users) {
                    if(err == error.ERROR) {
                        call_callback(callback, [error.NOT_MODIFIED, s_tid]);
                    }
                    else {
                        call_callback(callback, [error.OK, s_tid, users]);
                    }
                })
            }
        });
    },

    /**
     * 根据房间名查询消息
     * @param roomname
     * @param startScore
     * @param endScore
     * @param callback
     */
    queryMsgByRoomName : function(roomname,startScore,endScore,callback) {
        var args = arguments, len = args.length;
        startScore = isNaN(startScore) ? 0 : startScore;
        endScore = isNaN(endScore) ? 0 : endScore;

        var validLen = 4;
        if(len < validLen) {
            if(typeof args[len - 1] == 'function') {
                callback = args[len - 1];
            }
        }

        client.zrange(key_msg+roomname, startScore, endScore,'WITHSCORES', function(err, reply) {
            if(err) {
                call_callback(callback, [error.ERROR]);
            }
            else {
                call_callback(callback, [error.OK, reply]);
            }
        });
    },

    /**
     * 根据房间名查询最近消息
     * @param roomname
     * @param lastTag
     * @param callback
     */
    queryLastestMsgByRoomName : function (roomname, lastTag, callback) {

        if(typeof lastTag == 'undefined') {
            client.zcard(key_msg+roomname, function(err, count) {
                if(err) {
                    call_callback(callback, [error.OK, lastTag]);
                }
                else {
                    lastTag = count > 0 ? count - 1 : 0;
                    call_callback(callback, [error.OK, lastTag]);
                }
            });
        }
        else {
            roomAPI.queryMsgByRoomName(roomname, lastTag, -1, function(err, msgInfos) {
                if (err == error.ERROR) {
                    call_callback(callback, [error.OK, lastTag]);
                }
                else {
                    var i= 0,len = msgInfos.length, score = lastTag - 1, msgs = [];
                    for(;i<len;) {
                        msgs.push(msgInfos[i]);
                        if(i+2 >= len && i+1 < len) {
                            score = msgInfos[i+1];
                        }
                        i += 2;
                    }
                    lastTag = parseInt(score)+1;
                    call_callback(callback, [error.OK, lastTag, msgs])
                }
            });
        }
    },

    /**
     * 保存消息
     * @param roomname
     * @param msg
     * @param username
     * @param callback
     */
    saveMsg : function(roomname, msg,username, callback) {
        var key = key_msg + roomname,
            value = JSON.stringify({msg:msg,username:username,stamp:new Date().getTime()});

        client.multi()
            .zcard(key)
            .zadd(key, 0, value)
            .exec(function(err, replies) {
                if(err) {
                    roomAPI.saveMsg(roomname, msg, username, callback);
                }
                else {
                    var count = replies[0];
                    client.zadd(key, count, value, function(err, reply) {
                        call_callback(callback,[error.OK]);
                    });
                }
            });
    },

    /**
     * 创建房间
     * @param roomname
     * @param callback
     */
    createRoom : function(roomname, callback) {
        client.sismember('rooms',roomname, function(err, reply) {
            if(err || reply) {
                call_callback(callback,[error.ERROR,'已存在']);
            }
            else {
                client.sadd('rooms', roomname, function(err, reply) {
                    if(err) {
                        call_callback(callback, [error.ERROR, '创建失败']);
                    }
                    else {
                        call_callback(callback, [error.OK]);
                    }
                });
            }
        });
    }
};
module.exports = roomAPI;