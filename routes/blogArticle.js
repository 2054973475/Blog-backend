const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dayjs = require('dayjs');
function resultSuccess(result, { message = '' } = {}) {
  return {
    code: 20000,
    result,
    message,
    type: 'success',
  };
}
function resultError(
  message = 'Request failed',
  { code = 60204, result = null } = {}
) {
  return {
    code,
    result,
    message,
    type: 'error',
  };
}
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2);
    }
  );
  return hexArr.join('');
}
function tokenVerification(req, res, callback) {
  if (!req.headers.authorization) return res.send(resultError('Invalid token'));
  const token = req.headers.authorization;
  const sql = 'select * from users where token= ?;';
  connection.query(sql, [token], (error, results, fields) => {
    if (error) throw error;
    const errordata = 'The corresponding user information was not obtained!';
    if (results.length === 0) return resultError(errordata);
    callback(results[0].username);
  });
}

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'blog',
});
connection.connect();

router.get('/getAll', function (req, res, next) {
  tokenVerification(req, res, (username) => {
    const sql =
      'select ba.id,ba.title,ba.isRelease,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,ba.content,ba.classifyId,bc.name as classify from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id where ba.username = ?;';
    connection.query(sql, [username], (error, results, fields) => {
      if (error) throw error;
      results.forEach((element) => {
        if (element.isRelease === 1) {
          element.isRelease = true;
        } else {
          element.isRelease = false;
        }
      });
      res.send(resultSuccess(results));
    });
  });
});
router.get('/get', function (req, res, next) {
  tokenVerification(req, res, (username) => {
    const sql =
      'select ba.id,ba.title,ba.isRelease,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,ba.content,ba.classifyId,bc.name as classify from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id where ba.id = ?;';
    connection.query(sql, [req.query.id], (error, results, fields) => {
      if (error) throw error;
      if (results[0].isRelease === 1) {
        results[0].isRelease = true;
      } else {
        results[0].isRelease = false;
      }
      res.send(resultSuccess(results));
    });
  });
});
router.post('/set', (req, res, next) => {
  const { keys, values, id } = req.body;
  const value = values.map((item) =>{
    if(typeof item === 'object'){
      return item.toString()
    }else{
      return item
    }
  });
  const updateList = keys.map((key) => `${key}=?`).join(',');
  const sql = `update blogArticle set ${updateList},updateDate = ? where id = ? ;`;
  tokenVerification(req, res, (username) => {
    connection.query(
      sql,
      [...value, dayjs().format('YYYY-MM-DD HH:mm:ss'), id],
      (error, results, fields) => {
        if (error) throw error;
        try {
          res.send(resultSuccess(results[0], { message: '修改成功！' }));
        } catch (error) {
          res.send(resultError('修改失败！'));
        }
      }
    );
  });
});
router.post('/add', (req, res, next) => {
  const { keys, values } = req.body;
  const value = values.map((item) =>{
    if(typeof item === 'object'){
      return item.toString()
    }else{
      return item
    }
  });
  const sql = `insert into blogArticle(${keys.join(
    ','
  )},username,createDate,updateDate) values(${values
    .map(() => '?')
    .join(',')},?,?,?)`;
  tokenVerification(req, res, (username) => {
    connection.query(
      sql,
      [
        ...value,
        username,
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ],
      (error, results, fields) => {
        console.log(error);
        try {
          res.send(resultSuccess(results[0], { message: '添加成功！' }));
        } catch (error) {
          res.send(resultError('新增失败！'));
        }
      }
    );
  });
});
router.get('/delete', (req, res, next) => {
  tokenVerification(req, res, (username) => {
    const sql = 'delete from blogArticle where id = ?;';
    connection.query(sql, [req.query.id], (error, results, fields) => {
      if (error) throw error;
      res.send(resultSuccess(results, { message: '删除成功！' }));
    });
  });
});
module.exports = router;
