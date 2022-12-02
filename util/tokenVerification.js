const { connection }= require('../util/connection')
const { resultError }= require('../util/result')

module.exports={
  tokenVerification:(req, res, callback)=>{
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
}