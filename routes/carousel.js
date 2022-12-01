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
      'select * from carousel where username = ?;';
    connection.query(sql, [username], (error, results, fields) => {
      if (error) throw error;
      res.send(resultSuccess(results));
    });
  });
});
router.post('/set', (req, res, next) => {
  tokenVerification(req, res, (username) => {
    const { keys, values, id } = req.body;
    const updateList = keys
      .map((key, index) => `${key}=?`)
      .join(',');
    const sql = `update carousel set ${updateList} where id = ?;`;
    connection.query(
      sql,
      [...values,Number(id)],
      (error, results, fields) => {
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
  const sql = `insert into carousel(${keys.join(
    ','
  )},username) values(${values
    .map((item) => `?`)
    .join(',')},?)`;
  tokenVerification(req, res, (username) => {
    connection.query(
      sql,
      [
        ...values,
        username
      ],
      (error, results, fields) => {
        try {
          res.send(resultSuccess(results[0], { message: '新增成功！' }));
        } catch (error) {
          res.send(resultError('新增失败！'));
        }
      }
    );
  });
});

router.get('/delete', (req, res, next) => {
  tokenVerification(req, res, async (username) => {
      const sql = 'delete from carousel where id = ?;';
      connection.query(sql, [req.query.id], (error, results, fields) => {
        if (error) throw error;
        res.send(resultSuccess(results, { message: '删除成功！' }));
      });
  });
});
module.exports = router;
