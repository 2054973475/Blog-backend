const express = require('express');
const router = express.Router();
const fs = require('fs');
const { connection }= require('../util/connection')
const { resultSuccess, resultError }= require('../util/result')
const { tokenVerification }= require('../util/tokenVerification')

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
