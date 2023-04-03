const db = require('../db/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

// 注册
exports.regUser = (req, res) => {
  const userInfo = req.body;

  const sqlStr = 'select * from user where phone=?';
  db.query(sqlStr, userInfo.phone, (err, results) => {
    if (err) {
      return res.cc(err);
    };

    if (results.length > 0) {
      return res.cc('该手机号以被注册！');
    };



    userInfo.password = bcrypt.hashSync(userInfo.password, 3);

    // 如果还未注册
    const sql = 'insert into user (userName,password,phone) values(?,?,?)';
    db.query(sql, [userInfo.userName, userInfo.password, userInfo.phone], (err, results) => {
      if (err) {
        return res.cc(err)
      }

      if (results.affectedRows !== 1) {
        return res.cc('注册用户失败，请稍后再试！')
      }
      return res.cc('注册成功！', 0);
    });
  })
}

// 登陆
exports.login = (req, res) => {
  const userInfo = req.body;
  const sqlStr = 'select * from user where phone=?';
  db.query(sqlStr, userInfo.phone, (err, results) => {
    if (err) {
      return res.cc(err);
    }
    if (results.length !== 1) {
      return res.cc('无该账户');
    };
    if (!bcrypt.compareSync(userInfo.password, results[0].password)) {
      return res.cc('密码错误');
    };

    const user = { ...results[0], password: '', pic: '' };
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn });
    res.send({
      status: 0,
      message: '登陆成功',
      token: 'Bearer ' + tokenStr,
      data: results[0],
    });
    return;
  })

}
