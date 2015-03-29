define(function(require) {
    var $ = require('jquery');
    require('jqueryUI')($);

    $('#action_addRoom').click(function(e) {
        console.log('add room');
        $('#dia_addRoom').dialog({
            width:600,
            height:'auto',
            buttons : [{
                text : '确定',
                click : function() {
                    var roomName = $('#roomName').val();
                    var $_t = $(this);
                    if(!roomName) {
                        alert('input name');
                    }
                    $.ajax('/room/create',{
                        data:{name:roomName},
                        dataType:'json',
                        success:function(data) {
                            if(data.result){
                                $_t.dialog('close');
                                $_addRoomBox.before(generateBox(roomName));
                            }
                            else {

                            }
                        },
                        async:true
                    });
                }
            }]
        });
    });

    //请求房间
    var $_addRoomBox = $('#addRoomBox');
    function generateBox(name) {
        var box = $(document.createElement('div')).addClass('roomBox box');
        box.append('<div class="name">' + name + '</div><div class="count">'+ 0+'</div>');

        box.click(function(e) {
            window.location.href = '/room?name='+name;
        });
        return box;
    }


    $.ajax('/room/list',{
        dataType:'json',
        success:function(data){
            if(data.result) {
                $('.box').remove();
                var list = data.data;
                for(var i=0;i<list.length;i++) {
                    $_addRoomBox.before(generateBox(list[i]));
                }
            }
        }
    });
});