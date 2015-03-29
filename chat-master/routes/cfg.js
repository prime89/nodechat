var express = require('express');

var boostrap = require('./index');
var users = require('./users');
var room = require('./room');

module.exports = {
    use : function(app) {
        app.use('/', boostrap);
        app.use('/users', users);
        app.use('/room', room);
    }
};