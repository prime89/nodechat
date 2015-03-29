var express = require('express');
var router = express.Router();

var roomAPI = require('./../lib/room');

/**
 * filter 4 isloggedin
 */
router.get('/',function(req,res, next) {
    if(!req.session.username) {
        res.redirect('/users/login');
    }
    else {
        next();
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
    var username = req.session.username;
    var roomname = req.session.roomname;
    if(roomname) {
        roomAPI.outRoom(roomname, username, function() {
            res.render('index', { title: 'Express' });
        });
    }
    else {
        res.render('index', { title: 'Express' });
    }
});

module.exports = router;
