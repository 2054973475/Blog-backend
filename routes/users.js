const express = require("express");
const router = express.Router();
const { connection, connectionQuery } = require("../util/connection");
const { resultSuccess, resultError } = require("../util/result");
const { tokenVerification } = require("../util/tokenVerification");
const { createToken } = require("../util/token");

router.post("/login", function (req, res, next) {
  const { username, password } = req.body;
  const sql = "select * from users where username= ? and password = ?;";
  connection.query(sql, [username, password], (error, results, fields) => {
    if (error) throw error;
    if (results.length !== 0) {
      const data = {
        username: results[0].username,
        password: results[0].password,
        power: results[0].power,
      };
      const token = createToken(data);
      res.send(resultSuccess(token, { message: "登录成功" }));
    } else {
      res.send(resultError("帐户或密码不正确！"));
    }
  });
});

router.get("/getInfo", function (req, res, next) {
  tokenVerification(req, res, (username) => {
    const sql = "select * from userInfo where username= ?;";
    connection.query(sql, [username], (error, results, fields) => {
      if (error) throw error;
      delete results[0].id;
      res.send(resultSuccess(results[0]));
    });
  });
});

router.post("/setInfo", (req, res, next) => {
  const { keys, values } = req.body;
  const updateList = keys.map((key, index) => `${key}=?`).join(",");
  const sql = `update userInfo set ${updateList} where username = ?;`;
  tokenVerification(req, res, (username) => {
    connection.query(sql, [...values, username], (error, results, fields) => {
      if (error) throw error;
      res.send(resultSuccess(results, { message: "修改成功！" }));
    });
  });
});

router.post("/updatePassword", async (req, res, next) => {
  const { oldPass, newPass } = req.body;
  const sql1 = 'select * from users where username = "admin" and password = ?;';
  const sql2 = 'update users set password = ? where username = "admin";';
  const res1 = await connectionQuery(sql1, [oldPass]);
  if (res1.length === 0) {
    res.send(resultError("旧密码错误，修改失败！"));
  } else {
    const res1 = await connectionQuery(sql2, [newPass]);
    res.send(resultSuccess({ message: "修改成功！" }));
  }
});
module.exports = router;
