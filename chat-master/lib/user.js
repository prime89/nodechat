var redis = require('redis');
var redisCfg = require('./../cfg/redisCfg.ini');
var error = require('./../cfg/errorCode.ini');

var client = redis.createClient(redisCfg.port, redisCfg.ip);

var t_users = 't_users',
    t_user_passwd = 't_user_passwd';

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

/**
 * 设置用户密码， 不对外暴露
 * @param username
 * @param password
 * @param callback
 */
function setPassword(username, password, callback) {
    client.sadd(t_user_passwd, username+password, function(err, reply) {
        if(err) {
            setPassword(username, password, callback);
        }
        else {
            call_callback(callback, [error.OK]);
        }
    });
}

/**
 * 用户对外接口
 * @type {{addUser: Function, checkLogin: Function, delUser: Function, queryUsersInRoom: Function, checkUserHeart: Function}}
 */
var userAPI = {
    /**
     * 添加用户 | 注册用户
     * @param username
     * @param password
     * @param callback
     */
    addUser : function(username, password, callback) {
        var callee = arguments.callee;
        client.multi()
            .sismember(t_users, username)
            .sadd(t_users, username)
            .exec(function(err, replies) {
                if(err) {
                    callee(username, callback);
                }
                else if(replies[0] != 0){
                    call_callback(callback, [error.ERROR]);
                }
                else {
                    setPassword(username, password, callback);
                }
            });
    },
    /**
     * 用户登陆校验
     * @param username
     * @param password
     * @param callback
     */
    checkLogin : function(username, password, callback) {
        client.sismember(t_users, username, function(err, reply) {
            if(err || reply == 0) {
                call_callback(callback, [error.ERROR,'notexist']);
            }
            else {
                client.sismember(t_user_passwd, username+password, function(err, reply) {
                    if(err || reply == 0) {
                        call_callback(callback, [error.ERROR,'checkerror']);
                    }
                    else {
                        call_callback(callback, [error.OK]);
                    }
                });
            }
        })
    },
    delUser : function(username, callback) {

    },
    queryUsersInRoom : function(roomname, callback) {

    },
    /**
     * 监测用户心跳
     */
    checkUserHeart : function() {

    }
};
module.exports = userAPI;