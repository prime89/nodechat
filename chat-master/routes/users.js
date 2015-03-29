var express = require('express');
var router = express.Router();

var userAPI = require('./../lib/user');
var error = require('./../cfg/errorCode.ini');

/* GET users listing. */
router.get('/', function(req, res, next) {

});

/**
 * 登陆页面
 */
router.get('/login', function(req, res, next){
  //req.session.destroy();
  res.render('users/login',{title:'login'});
});
/**
 * 登陆提交
 */
router.get('/loginpost', function(req, res, next) {
  var username = req.query.username;
  var password = req.query.password;
  var url = req.session.originalUrl;
  userAPI.checkLogin(username, password, function(err, msg) {
    if(err == error.ERROR) {
      res.redirect('/users/login?code=1&msg='+msg);
    }
    else {
      req.session.regenerate(function(err) {
        req.session.username = username;
        if(url) {
          res.redirect(url);
        }
        else {
          res.redirect('/');
        }
      });
    }
  })
});
/**
 * 跳出登陆
 */
router.get('/logout', function(req, res, next) {
    res.redirect('/users/login');
});
/**
 * 注册
 */
router.get('/reg', function(req, res) {
  res.render('users/reg',{title:'reg'});
});
/**
 * 注册提交
 */
router.get('/regpost', function(req, res) {
  var username = req.query.username;
  var password = req.query.password;

  userAPI.addUser(username, password, function(err) {
    if(err == error.ERROR) {
      res.redirect('/users/reg?code=1');
    }
    else {
      res.redirect('/');
    }
  })
});
module.exports = router;
