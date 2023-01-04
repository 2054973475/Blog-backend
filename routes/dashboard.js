const express = require("express");
const router = express.Router();
const { resultSuccess, resultError } = require("../util/result");
const { tokenVerification } = require("../util/tokenVerification");
const { connectionQuery } = require("../util/connection");

router.get("/getDashboardNumber", (req, res, next) => {
  tokenVerification(req, res, async () => {
    const sql1 = `SELECT count(*) as count from blogarticle;`;
    const sql2 = `SELECT tags from blogarticle;`;
    const sql3 = `SELECT count(*) as count from blogclassify;`;
    const sql4 = `SELECT count(*) as count from leavingmessage;`;
    const res1 = await connectionQuery(sql1, []);
    const res2 = await connectionQuery(sql2, []);
    const res3 = await connectionQuery(sql3, []);
    const res4 = await connectionQuery(sql4, []);
    const res2_2 = [];
    res2.forEach((element) => {
      element.tags.split(",").forEach((item) => {
        res2_2.push(item);
      });
    });
    res.send(
      resultSuccess({
        blogarticleNumber: res1[0].count,
        tagsNumber: [...new Set(res2_2)].length,
        blogclassifyNumber: res3[0].count,
        leavingmessageNumber: res4[0].count,
      })
    );
  });
});
router.get("/getBlogClassifyAnalysisData", (req, res, next) => {
  tokenVerification(req, res, async () => {
    const sql1 = `SELECT id,name from blogclassify;`;
    const sql2 = `SELECT classifyId,count(*) as count from blogarticle GROUP BY classifyId;`;
    const res1 = await connectionQuery(sql1, []);
    const res2 = await connectionQuery(sql2, []);
    const res3 = res1.map((item) => {
      return {
        name: item.name,
        value: res2.find((i) => i.classifyId === item.id)
          ? res2.find((i) => i.classifyId === item.id).count
          : 0,
      };
    });
    res.send(resultSuccess(res3));
  });
});
router.get("/getBlogTagsAnalysisData", (req, res, next) => {
  tokenVerification(req, res, async () => {
    const sql1 = `select tags from blogarticle;`;
    const res1 = await connectionQuery(sql1, []);
    console.log(res1);
    let tags = [];
    res1.forEach((item) => {
      tags = [...tags, ...item.tags.split(",")];
    });
    tags = [...new Set(tags)];
    tags = tags.map((item) => {
      const data = { value: 0, name: item };
      res1.forEach((i) => {
        if (i.tags.indexOf(item) !== -1) {
          data.value++;
        }
      });
      return data
    });
    res.send(resultSuccess(tags));
  });
});
router.get("/getArticleAccessTop", (req, res, next) => {
  tokenVerification(req, res, async () => {
    const sql = `select id,title,viewNumber from blogarticle where isRelease = 1 ORDER BY viewNumber DESC LIMIT 0,8;`;
    const res1 = await connectionQuery(sql, []);
    res.send(resultSuccess(res1));
  });
});
router.get("/getRecentArticles", (req, res, next) => {
  tokenVerification(req, res, async () => {
    const sql = `select ba.id,ba.title,bc.name as classifyName,ba.viewNumber,ba.releaseDate from blogarticle ba JOIN blogclassify bc on ba.classifyId = bc.id where isRelease = 1 ORDER BY ba.releaseDate DESC LIMIT 0,5;`;
    const res1 = await connectionQuery(sql, []);
    res.send(resultSuccess(res1));
  });
});
router.get("/getRecentComments", (req, res, next) => {
  tokenVerification(req, res, async () => {
    const sql = `select ba.id,lm.name,lm.content,ba.title,lm.time from blogarticle ba right JOIN (
        SELECT lmu.name,lm.content,lm.articleId,lm.time from leavingmessage lm JOIN leavingmessageuser lmu on lm.leavingMessageUserId=lmu.id
        ) lm on lm.articleId = ba.id ORDER BY lm.time DESC LIMIT 0,5;`;
    const res1 = await connectionQuery(sql, []);
    res.send(resultSuccess(res1));
  });
});

module.exports = router;
