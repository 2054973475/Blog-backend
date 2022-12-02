const express = require('express');
const router = express.Router();
const { connection }= require('../util/connection')


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
router.get('/getLinks', function (req, res, next) {
  const sql =
    'select * from links where username = "admin";';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});
router.get('/getCarousel', function (req, res, next) {
  const sql =
    'select * from carousel where username = "admin";';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});
router.post('/getAllArticle', function (req, res, next) {
  console.log(req.body)
  const tags=req.body.tags
  const classify=req.body.classify
  const title=req.body.title
  const page=req.query.page?Number(req.query.page):0
  const pageCount=req.query.pageCount?Number(req.query.pageCount):10
  const sql =
    `select ba.id,ba.viewNumber,ba.title,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,bc.name as classify 
    from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id 
    where ba.username = "admin" and ba.isRelease = 1 
    ${tags?'and ba.tags like "%'+tags+'%"':''} ${title?'and ba.title like "%'+title+'%"':''} ${classify?'and bc.name = "'+classify+'"':''} 
    ORDER BY ba.releaseDate DESC LIMIT ?,?;`;
  connection.query(sql, [page*pageCount,pageCount], async (error, results, fields) => {
    if (error) throw error;
    const total = await getArticleTotal(tags,classify,title)
    results.forEach((element) => {
      element.tags = element.tags.split(',');
    });
    res.send({
      data:results,
      total:total
    });
  });
});
router.get('/getTags', function (req, res, next) {
  const sql =
    'select * from blogArticle where username = "admin" and isRelease = 1;';
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    let tagsList = []
    const tagsObj = {}
    results.forEach((element) => {
      element.tags = [...element.tags.split(',')];
      tagsList = [...tagsList,...element.tags]
    });
    tagsList = [...new Set(tagsList)]
    tagsList.forEach(item=>{
      results.forEach(element=>{
        if(element.tags.findIndex(i=>i===item) !== -1){
          if(tagsObj[item]===undefined){
            tagsObj[item]=1
          }else{
            tagsObj[item] = tagsObj[item]+1
          }
        }
      })
    })
    res.send(tagsObj);
  });
});
router.get('/getArticle', function (req, res, next) {
  const id = req.query.id
  const sql =`
  select ba.id,ba.viewNumber,ba.title,ba.summary,ba.tags,ba.releaseDate,ba.coverImg,ba.content,bc.name as classify 
  from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id 
  where ba.username = "admin" and ba.id IN
  (select case 
  when SIGN(id-${id})>0 then min(id) 
  when sign(id-${id})<0 then max(id) 
  else id end from blogarticle 
  GROUP BY SIGN(id-${id}) 
  ORDER BY SIGN(id-${id})) 
  ORDER BY id;
  `
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error;
    results.forEach((element) => {
      element.tags = element.tags.split(',');
    });
    res.send(results);
  });
});

function getArticleTotal(tags,classify,title){
  return new Promise((resolve,reject)=>{
    const sql=`select count(*) as total 
    from blogArticle ba left join blogClassify bc on ba.classifyId = bc.id 
    where ba.username = "admin" and ba.isRelease = 1 
    ${tags?'and ba.tags like "%'+tags+'%"':''} ${title?'and ba.title like "%'+title+'%"':''} ${classify?'and bc.name = "'+classify+'"':''} ;`
    connection.query(sql,[],(error, results, fields)=>{
      resolve(results[0].total)
    })
  })
}
module.exports = router;
