const express = require('express');
const router = express.Router();
const { connection }= require('../util/connection')
const { resultSuccess, resultError }= require('../util/result')
const { tokenVerification }= require('../util/tokenVerification')


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
