const express = require("express");
const router = express.Router();
const { connectionQuery } = require("../util/connection");
const { tokenVerification } = require("../util/tokenVerification");
const { resultSuccess, resultError } = require("../util/result");
router.get("/getLeavingMessageUser", async (req, res, next) => {
  tokenVerification(req, res, async (username) => {
    const sql = `SELECT lmu.id,lmu.name,lmu.email,lmu.lastmessagetime,lmu.identity,count(lm.leavingMessageUserId) as messagesnumber 
    FROM leavingmessageuser lmu left join leavingmessage lm on lmu.id=lm.leavingMessageUserId 
    GROUP BY lmu.name;`;
    const data = await connectionQuery(sql, []);
    res.send(resultSuccess(data));
  });
});

router.post("/deleteLeavingMessageUser", async (req, res, next) => {
  const id = req.body.id;
  tokenVerification(req, res, async (username) => {
    const sql1 = `DELETE FROM leavingmessage  where pid in (select lm.id from (select id from leavingmessage where leavingMessageUserId = ?) as lm);`;
    const sql2 = `DELETE FROM leavingmessage  where leavingMessageUserId = ?;`;
    const sql3 = `DELETE FROM leavingmessageuser  where id = ?;`;
    const re1 = await connectionQuery(sql1, [id]);
    const re2 = await connectionQuery(sql2, [id]);
    const re3 = await connectionQuery(sql3, [id]);
    res.send(resultSuccess(re3, { message: "删除成功" }));
  });
});
router.get("/getLeavingMessage", async (req, res, next) => {
  const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 0;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 8;
  tokenVerification(req, res, async (username) => {
    const sql = `select lm.id,lm.replyMessageId,lm.time,lm.articleId,lm.name,lm.email,lm.identity,lm.content,lmu.name as replyName,lm.replyContent from 
    (select lm.id,lm.replyMessageId,lm.time,lm.articleId,lmu.name,lmu.email,lmu.identity,lm.content,lm.replyId,lm.replyContent from leavingmessage lm JOIN leavingmessageuser lmu on lm.leavingMessageUserId=lmu.id) lm left join leavingmessageuser lmu on lm.replyId = lmu.id ORDER BY lm.time DESC LIMIT ?,?;`;
    const data = await connectionQuery(sql, [pageNumber * pageSize, pageSize]);
    res.send(
      resultSuccess({ data: data, total: await getLeavingMessageLength() })
    );
  });
});
router.post("/deleteLeavingMessage", async (req, res, next) => {
  const id = req.body.id;
  tokenVerification(req, res, async (username) => {
    const sql = `DELETE FROM leavingmessage  where pid = ? or replyMessageId = ? or id = ?;`;
    const re = await connectionQuery(sql, [id, id, id]);
    res.send(resultSuccess(re, { message: "删除成功" }));
  });
});

async function getLeavingMessageLength() {
  const sql = `select count(*) as count from 
  (select lm.time,lm.articleId,lmu.name,lmu.email,lmu.identity,lm.content,lm.replyId,lm.replyContent from leavingmessage lm JOIN leavingmessageuser lmu on lm.leavingMessageUserId=lmu.id) lm left join leavingmessageuser lmu on lm.replyId = lmu.id;`;
  const data = await connectionQuery(sql, []);
  return data[0].count;
}
module.exports = router;
