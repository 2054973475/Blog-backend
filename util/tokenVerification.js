const { connection }= require('./connection')
const { resultError }= require('./result')
const { verifyToken } = require("./token");
module.exports={
  tokenVerification:(req, res, callback)=>{
    if (!req.headers.authorization) return res.send(resultError('Invalid token'));
    const token = req.headers.authorization;
    verifyToken(token).then((data)=>{
      callback(data.username);
    },(error)=>{
      const errordata = 'The corresponding user information was not obtained!';
      return resultError(errordata)
    })
  }
}