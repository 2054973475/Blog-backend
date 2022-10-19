const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'blog',
});
connection.connect();
router.get('/getInfo', function (req, res, next) {
  const sql = 'select id,name,email,phone,introduction,avatar,QQ,userDesc from userInfo where username= "admin";';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    res.send(results[0]);
  });
});
router.get('/getClassify', function (req, res, next) {
  const sql =
    'select bc.id,bc.name,count(ba.classifyId) as count from blogClassify bc left join blogArticle ba on bc.id=ba.classifyId where bc.username="admin" GROUP BY bc.name,bc.id,ba.classifyId;';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});
router.get('/getAllArticle', function (req, res, next) {
  const sql =
    'select ba.id,ba.viewNumber,ba.title,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,bc.name as classify from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id where ba.username = "admin" and ba.isRelease = 1;';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    results.forEach((element) => {
      element.tags = element.tags.split(',');
    });
    res.send(results);
  });
});
router.get('/getArticle', function (req, res, next) {
  const sql =
    'select ba.id,ba.viewNumber,ba.title,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,ba.content,bc.name as classify from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id where ba.username = "admin" and ba.id = ?;';
  connection.query(sql, [req.query.id], (error, results, fields) => {
    if (error) throw error;
    results.forEach((element) => {
      element.tags = element.tags.split(',');
    });
    res.send(results[0]);
  });
});
module.exports = router;
