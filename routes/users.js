const express = require('express');
const router = express.Router();
const { connection }= require('../util/connection')
const { resultSuccess, resultError }= require('../util/result')
const { tokenVerification }= require('../util/tokenVerification')


router.post('/login', function (req, res, next) {
  const { username, password } = req.body;
  const sql = 'select * from users where username= ? and password = ?;';
  connection.query(sql, [username, password], (error, results, fields) => {
    if (error) throw error;
    if (results.length !== 0) {
      res.send(resultSuccess(results[0].token, { message: '登录成功' }));
    } else {
      res.send(resultError('帐户或密码不正确！'));
    }
  });
});

router.get('/getInfo', function (req, res, next) {
  tokenVerification(req, res, (username) => {
    const sql = 'select * from userInfo where username= ?;';
    connection.query(sql, [username], (error, results, fields) => {
      if (error) throw error;
      delete results[0].id;
      res.send(resultSuccess(results[0]));
    });
  });
});

router.post('/setInfo', (req, res, next) => {
  const { keys, values } = req.body;
  const updateList = keys
    .map((key, index) => `${key}=?`)
    .join(',');
  const sql = `update userInfo set ${updateList} where username = ?;`;
  tokenVerification(req, res, (username) => {
    connection.query(sql, [...values,username], (error, results, fields) => {
      if (error) throw error;
      res.send(resultSuccess(results,{message:'修改成功！'}));
    });
  });
});
module.exports = router;
