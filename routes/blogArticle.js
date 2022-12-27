const express = require("express");
const router = express.Router();
const { connection } = require("../util/connection");
const { resultSuccess, resultError } = require("../util/result");
const { tokenVerification } = require("../util/tokenVerification");

router.get("/getAll", function (req, res, next) {
  tokenVerification(req, res, (username) => {
    const sql = `select ba.id,ba.title,ba.isRelease,ba.tags,ba.releaseDate,ba.classify,ba.viewNumber,count(lm.articleId) as messagesNumber 
    from(select ba.id,ba.title,ba.isRelease,ba.tags,ba.releaseDate,bc.name as classify,ba.viewNumber 
      from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id where ba.username = ?) ba 
      left join leavingmessage lm on ba.id = lm.articleId GROUP BY ba.id;`;
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
router.get("/get", function (req, res, next) {
  tokenVerification(req, res, (username) => {
    const sql =
      "select ba.id,ba.title,ba.isRelease,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,ba.content,ba.classifyId,bc.name as classify from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id where ba.id = ?;";
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
router.post("/set", (req, res, next) => {
  const { keys, values, id } = req.body;
  const value = values.map((item) => {
    if (typeof item === "object") {
      return item.toString();
    } else {
      return item;
    }
  });
  const updateList = keys.map((key) => `${key}=?`).join(",");
  const sql = `update blogArticle set ${updateList} where id = ? ;`;
  tokenVerification(req, res, (username) => {
    connection.query(sql, [...value, id], (error, results, fields) => {
      if (error) throw error;
      try {
        res.send(resultSuccess(results[0], { message: "修改成功！" }));
      } catch (error) {
        res.send(resultError("修改失败！"));
      }
    });
  });
});
router.post("/add", (req, res, next) => {
  const { keys, values } = req.body;
  const value = values.map((item) => {
    if (typeof item === "object") {
      return item.toString();
    } else {
      return item;
    }
  });
  const sql = `insert into blogArticle(${keys.join(
    ","
  )},username) values(${values.map(() => "?").join(",")},?)`;
  tokenVerification(req, res, (username) => {
    connection.query(sql, [...value, username], (error, results, fields) => {
      try {
        res.send(resultSuccess(results, { message: "添加成功！" }));
      } catch (error) {
        res.send(resultError("新增失败！"));
      }
    });
  });
});
router.get("/delete", (req, res, next) => {
  tokenVerification(req, res, (username) => {
    const sql = "delete from blogArticle where id = ?;";
    connection.query(sql, [req.query.id], (error, results, fields) => {
      if (error) throw error;
      res.send(resultSuccess(results, { message: "删除成功！" }));
    });
  });
});
module.exports = router;
