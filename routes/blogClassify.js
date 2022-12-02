const express = require('express');
const router = express.Router();
const { connection }= require('../util/connection')
const { resultSuccess, resultError }= require('../util/result')
const { tokenVerification }= require('../util/tokenVerification')


router.get('/getAll', function (req, res, next) {
  tokenVerification(req, res, (username) => {
    const sql =
      'select bc.id,bc.name,bc.word,bc.classifyDesc,count(ba.classifyId) as blogNumber from blogClassify bc left join blogArticle ba on bc.id=ba.classifyId where bc.username=? GROUP BY bc.name,bc.id,ba.classifyId,bc.word,bc.classifyDesc;';
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
    const sql = `update blogClassify set ${updateList} where id = ?;`;
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
  const sql = `insert into blogClassify(${keys.join(
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
    if (await isEmpty(req.query.id)) {
      const sql = 'delete from blogClassify where id = ?;';
      connection.query(sql, [req.query.id], (error, results, fields) => {
        if (error) throw error;
        res.send(resultSuccess(results, { message: '删除成功！' }));
      });
    } else {
      res.send(resultError('删除失败,存在博客分类为此分类！'));
    }
  });
});
function isEmpty(id) {
  return new Promise((resolve,reject)=>{
    const sql = 'select count(*) as count from blogArticle where classifyId=?;';
    connection.query(sql, [id], (error, results, fields) => {
      if (error) throw error;
      if (results[0].count === 0) {
        resolve(true)
      } else {
        resolve(false)
      }
    });
  })
}
module.exports = router;
