const mysql = require('mysql');

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'work',
  // multipleStatements: true,
});

db.async = []

db.async.all = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      resolve({ err, rows })
    })
  })
}

module.exports = db;