const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const fs = require('fs');
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

router.post('/upload', function (req, res, next) {
    const { imgData } = req.body;
  tokenVerification(req, res, async(username) => {
      res.send(resultSuccess(await write(imgData)));
  });
});
function write(imgData){
    return new Promise((resolve,reject)=>{
        const path="/image/image"+new Date().getTime()+".png"
        const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
        const dataBuffer = Buffer.from(base64Data, 'base64'); 
        fs.writeFile('./public'+path, dataBuffer, function(err) {
            if(err){
                reject(err)
            }else{
                resolve({
                    mag:"成功",
                    imgUrl:path
                })
            }
        });
    })
}
module.exports = router;
