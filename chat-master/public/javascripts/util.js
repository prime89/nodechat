define(function(){
    var $ = require('jquery');
    require('jqueryUI')($);

    /* 扩展msg*/
    var _opt = {
        msgtype : 'ok',
        width : '400',
        height : 'auto'
    };
    var _msg = $.fn.message = function(opt) {

    }

    _msg.warn = function(type, tips) {

    }

    var _cfg = {
        width : '400',
        height : 'auto'

    };
    return {
        dialog : function(cfg) {

        },
        message : {

        }
    };
});