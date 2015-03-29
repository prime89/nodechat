define(function(require, exports){
    var $ = require('jquery');
    var isIE=navigator.userAgent.match(/MSIE (\d)/i);
    isIE=isIE?isIE[1]:undefined;

    var t, _opt = {};

    function longPolling(opt,force) {
        var xhr, callee;
        if(force) {
            _opt[opt.tag] = {};
            for(v in opt) {
                _opt[opt.tag][v] = opt[v];
            }
        }
        callee = arguments.callee;
        if(isIE < 11) {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        else {
            xhr = new XMLHttpRequest();
        }
        xhr.onreadystatechange = function() {
            if( xhr.readyState == 4) {
                var rsp = xhr.responseText;
                rsp = $.parseJSON(rsp);
                if(rsp.status != 'not-modified') {
                    if(typeof opt.callback == 'function') {
                        opt.callback(rsp);
                    }
                }
                opt.url = _opt[opt.tag].url + '&tid=' + rsp.tid;
                lazzyTask(callee, 1000, opt)
            }

        }
        xhr.open('get', opt.url, true);
        xhr.send();
    }

    function lazzyTask(task, time) {
        var args = Array.prototype.slice.call(arguments, 2);
        var _fun = function() {
            task.apply(null, args);
        }
        return window.setTimeout(_fun, time);
    }

    function generateUserItem(user) {
        var $_item = $(document.createElement('div')).addClass('userItem').append(user);
        return $_item;
    }

    function generateMsgItem(msg) {
        var $_msg = $(document.createElement('div')).addClass('msg').append(msg.username+':'+msg.msg);
        return $_msg;
    }

    var $_userContainer =  $('.userContainer'),
        $_msgInputArea = $('#msgInputArea'),
        $_msgContainer = $('.msgContainer');
    exports.init = function(name) {
        //long poll 请求用户信息
        longPolling({
            url : '/room/users?name='+name,
            callback : function(data) {
                $_userContainer.empty();
                if(data.result) {
                  var users = data.data;
                    for(var i=0;i<users.length;i++) {
                        $_userContainer.append(generateUserItem(users[i]));
                    }
                }
            },
            tag:'user'
        },true);

        //long polling 消息
        longPolling({
            url : '/room/msg?name='+name,
            callback : function(data) {
                if(data.result) {
                    var msgs = data.data, msg;
                    var i= 0,len = msgs.length;
                    for(;i<len;i++) {
                        msg = $.parseJSON(msgs[i]);
                        $_msgContainer.append(generateMsgItem(msg));
                    }
                }
            },
            tag:'msg'
        },true)

        $('.outroom').click(function() {
            window.location.href = '/';
        });

        $('.sendBtn').click(function() {
            var txt = $_msgInputArea.val();
            if(!txt) {
                return;
            }
            $.ajax('/room/send',{
                data : {msg :txt},
                dataType: 'json',
                success:function(data) {
                    if(data.result) {
                        $_msgInputArea.val('');
                    }
                },
                async:true
            });
        });
    }


    exports.addRoom = function() {
        console.log('xxx');
    }
});