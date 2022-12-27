const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: '123qwezxc',
  // password: "123456",
  database: "blog",
});
connection.connect();
const connectionQuery = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results, fields) => {
      if (error) throw error;
      resolve(results);
    });
  });
};
module.exports = {
  connection: connection,
  connectionQuery: connectionQuery,
};
