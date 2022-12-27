const express = require("express");
const router = express.Router();
const { connection, connectionQuery } = require("../util/connection");
const dayjs = require("dayjs");
router.get("/getInfo", function (req, res, next) {
  const sql =
    'select id,name,email,phone,introduction,avatar,QQ,userDesc from userInfo where username= "admin";';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    res.send(results[0]);
  });
});
router.get("/getClassify", function (req, res, next) {
  const sql =
    'select bc.id,bc.name,count(ba.classifyId) as count from blogClassify bc left join blogArticle ba on bc.id=ba.classifyId where bc.username="admin" GROUP BY bc.name,bc.id,ba.classifyId;';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});
router.get("/getLinks", function (req, res, next) {
  const sql = 'select * from links where username = "admin";';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});
router.get("/getCarousel", function (req, res, next) {
  const sql = 'select * from carousel where username = "admin";';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});
router.post("/getAllArticle", function (req, res, next) {
  const tags = req.body.tags;
  const classify = req.body.classify;
  const title = req.body.title;
  const page = req.query.page ? Number(req.query.page) : 0;
  const pageCount = req.query.pageCount ? Number(req.query.pageCount) : 10;
  const sql = `select ba.id,ba.title,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,ba.classify,ba.viewNumber,count(lm.articleId) as messagesNumber from
  (select ba.id,ba.viewNumber,ba.title,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,bc.name as classify 
      from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id 
      where ba.username = "admin" and ba.isRelease = 1 
      ${tags ? 'and ba.tags like "%' + tags + '%"' : ""} ${
    title ? 'and ba.title like "%' + title + '%"' : ""
  } ${classify ? 'and bc.name = "' + classify + '"' : ""} 
      ORDER BY ba.releaseDate DESC LIMIT ?,?) ba left join leavingmessage lm on ba.id = lm.articleId GROUP BY ba.id;`;
  connection.query(
    sql,
    [page * pageCount, pageCount],
    async (error, results, fields) => {
      if (error) throw error;
      const total = await getArticleTotal(tags, classify, title);
      results.forEach((element) => {
        element.tags = element.tags.split(",");
      });
      res.send({
        data: results,
        total: total,
      });
    }
  );
});
router.get("/getTags", function (req, res, next) {
  const sql =
    'select * from blogArticle where username = "admin" and isRelease = 1;';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    let tagsList = [];
    const tagsObj = {};
    results.forEach((element) => {
      element.tags = [...element.tags.split(",")];
      tagsList = [...tagsList, ...element.tags];
    });
    tagsList = [...new Set(tagsList)];
    tagsList.forEach((item) => {
      results.forEach((element) => {
        if (element.tags.findIndex((i) => i === item) !== -1) {
          if (tagsObj[item] === undefined) {
            tagsObj[item] = 1;
          } else {
            tagsObj[item] = tagsObj[item] + 1;
          }
        }
      });
    });
    res.send(tagsObj);
  });
});
router.get("/getArticle", async function (req, res, next) {
  const id = req.query.id;
  const sql = `
  select ba.id,ba.title,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,ba.content,ba.classify,ba.viewNumber,count(lm.articleId) as messagesNumber from (select ba.id,ba.viewNumber,ba.title,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,ba.content,bc.name as classify 
    from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id 
    where ba.username = "admin" and ba.id IN
    (select case 
    when SIGN(id-${id})>0 then min(id) 
    when sign(id-${id})<0 then max(id) 
    else id end from blogarticle 
    GROUP BY SIGN(id-${id}) 
    ORDER BY SIGN(id-${id})) 
    ORDER BY id) ba left join leavingmessage lm on ba.id = lm.articleId GROUP BY ba.id;
  `;
  const sql1 = `update blogarticle set viewNumber=viewNumber+1 where id=${id}; `;
  const re = await connectionQuery(sql1, []);
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    results.forEach((element) => {
      element.tags = element.tags.split(",");
    });
    res.send(results);
  });
});
router.get("/getLeavingMessage", async (req, res, next) => {
  const id = req.query.id;
  const sql = `
  select lm.id,lm.pid,lm.time,lm.content,lm.replyid,lm.replycontent,lm.articleid,lmu.id as userid,lmu.name,lmu.email,lmu.identity as useridentity 
  from leavingmessage lm left join leavingmessageuser lmu on lm.leavingmessageuserid = lmu.id 
  where lm.articleid=${id};`;
  const sql1 = "select * from leavingmessageuser where id=?;";
  const results = await connectionQuery(sql, []);
  for (let i = 0; i < results.length; i++) {
    const re = await connectionQuery(sql1, [results[i].replyid]);
    if (re.length === 0) {
      results[i]["replyname"] = "";
    } else {
      results[i]["replyname"] = re[0].name;
      results[i]["replyidentity"] = re[0].identity;
    }
  }
  res.send(results);
});
router.post("/addLeavingMessage", async (req, res, next) => {
  const body = req.body;
  const id = await verificationLeavingMessageUser(body.name, body.email);
  if (id === -1) {
    res.send({ mag: "昵称重复，请重新输入昵称" });
  } else {
    delete body.name;
    delete body.email;
    let sql_keys = "";
    for (let i = 0; i < Object.keys(body).length; i++) {
      sql_keys += Object.keys(body)[i]+',';
    }
    const sql =`insert into leavingmessage(${sql_keys}leavingmessageuserid) VALUES(?,?,?,?,?,?,?,?);`;
    const results = await connectionQuery(sql, [...Object.values(body),id]);
    if (results.affectedRows === 1) {
      res.send({ mag: "留言发表成功！", status: 1 });
    } else {
      res.send({ mag: "留言发表失败！", status: 0 });
    }
  }
});

function verificationLeavingMessageUser(name, email) {
  return new Promise(async (resolve, reject) => {
    const time = dayjs().format("YYYY/MM/DD HH:mm");
    const sql1 = "select * from leavingmessageuser where name= ?;";
    const sql2 = "select * from leavingmessageuser where email=?;";
    const sql3 =
      "UPDATE leavingmessageuser SET name=?,lastmessagetime=? where email=?;";
    const sql4 =
      "insert into leavingmessageuser(name,email,lastmessagetime,identity) values(?,?,?,0);";

    const results1 = await connectionQuery(sql1, [name]);
    if (results1.length !== 0) {
      if (email === results1[0].email) {
        const results3 = await connectionQuery(sql3, [name, time, email]);
        resolve(results1[0].id);
      } else {
        resolve(-1);
      }
    } else {
      const results2 = await connectionQuery(sql2, [email]);
      if (results2.length !== 0) {
        const results3 = await connectionQuery(sql3, [name, time, email]);
        resolve(results2[0].id);
      } else {
        const results4 = await connectionQuery(sql4, [name, email, time]);
        resolve(results4.insertId);
      }
    }
  });
}
function getArticleTotal(tags, classify, title) {
  return new Promise(async (resolve, reject) => {
    const sql = `select count(*) as total 
    from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id 
    where ba.username = "admin" and ba.isRelease = 1 
    ${tags ? 'and ba.tags like "%' + tags + '%"' : ""} ${
      title ? 'and ba.title like "%' + title + '%"' : ""
    } ${classify ? 'and bc.name = "' + classify + '"' : ""} ;`;
    const results = await connectionQuery(sql, []);
    resolve(results[0].total);
  });
}
module.exports = router;
