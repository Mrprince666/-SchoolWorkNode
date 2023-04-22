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
  const sqlStr = 'select * from user where phone=? and type=?';
  db.query(sqlStr, [userInfo.phone, +userInfo.type], (err, results) => {
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

exports.getMyComment = async (req, res) => {
  const { userId, page = 1, pageCount = 5 } = req.query;
  const start = (page - 1) * pageCount;
  const sql = `select b.userName, b.realName,  b.pic, c.name, a.pic as image, a.id, a.like, a.time, a.userId, a.title, a.content, a.moduleId, d.name as pName, e.shortName from (comment a left join trade d on d.id = a.moduleId) left join company e on e.id = a.companyId, user b left join user_position c on c.userId = b.id where a.userId = b.id and a.userId = ? order by a.time desc limit ?, ?`;
  const { err, rows } = await db.async.all(sql, [+userId, start, +pageCount]);
  if (err) {
    return res.cc(err);
  };

  const sql2 = `select count(*) as total from (comment a left join trade d on d.id = a.moduleId) left join company e on e.id = a.companyId, user b left join user_position c on c.userId = b.id where a.userId = b.id and a.userId = ?`;
  const { rows: rows2 } = await db.async.all(sql2, [+userId]);

  res.send({
    status: 0,
    data: rows,
    total: rows2?.[0]?.total || 0,
  });
}

exports.getMyCollect = async (req, res) => {
  const { userId, page = 1, pageCount = 5 } = req.query;
  const start = (page - 1) * pageCount;
  const sql = `select b.userName, b.pic, c.name, a.id, a.like, a.time, a.userId, a.title, a.content, a.moduleId, a.pic as image, d.name as pName, e.shortName from (comment a left join trade d on d.id = a.moduleId) left join company e on e.id = a.companyId, user b left join user_position c on c.userId = b.id, comment_collect f where f.userId = ? and f.commentId = a.id and a.userId = b.id order by a.time desc limit ?, ?`;
  const { err, rows } = await db.async.all(sql, [+userId, start, +pageCount]);
  if (err) {
    return res.cc(err);
  };

  const sql2 = `select count(*) as total from (comment a left join trade d on d.id = a.moduleId) left join company e on e.id = a.companyId, user b left join user_position c on c.userId = b.id, comment_collect f where f.userId = ? and f.commentId = a.id and a.userId = b.id`;
  const { rows: rows2 } = await db.async.all(sql2, [+userId]);

  res.send({
    status: 0,
    data: rows,
    total: rows2?.[0]?.total || 0,
  });
}

exports.getMyInfo = async (req, res) => {
  const { userId } = req.query;
  const sql = 'select a.id, a.userName, a.phone, a.age, a.graduation, a.birthday, a.email, a.school, a.sex, a.companyId, a.tradeId, a.realName, a.pic, b.name as pName from user a left join user_position b on a.id = b.userId where a.id = ?';
  const { err, rows } = await db.async.all(sql, [+userId]);
  if (err) {
    return res.cc(err);
  };

  res.send({
    status: 0,
    data: rows[0],
  });
}

exports.updateMyInfo = async (req, res) => {
  const { userName, phone, age, graduation, birthday, email, school, sex, tradeId, realName, id, pName } = req.body;
  const sql = 'update user set userName = ?, phone = ?, age = ?, graduation = ?, birthday = ?, email = ?, school = ?, sex = ?, tradeId = ?, realName = ?  where id = ?';
  const { err, rows } = await db.async.all(sql, [userName, phone, age, graduation, birthday, email, school, sex, tradeId, realName, id]);
  if (err) {
    return res.cc(err);
  };

  const sql2 = 'update user_position set name = ? where userId = ?';
  const { err: err2, rows: row2 } = await db.async.all(sql2, [pName, id]);

  if (err2) {
    return res.cc(err2);
  };

  res.cc('修改成功', 0);
}

exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword, userId } = req.body;
  const sql = 'select password from user where id = ?';
  const { err, rows } = await db.async.all(sql, [userId]);
  if (err) {
    return res.cc(err);
  };
  if (!bcrypt.compareSync(oldPassword, rows[0].password)) {
    return res.cc('原密码错误');
  };
  const password = bcrypt.hashSync(newPassword, 3);
  const sql2 = 'update user set password = ? where id = ?';
  const { err: err2, rows: row2 } = await db.async.all(sql2, [password, userId]);

  if (err2) {
    return res.cc(err2);
  };

  res.cc('修改成功', 0);
}

exports.getNotes = async (req, res) => {
  const { userId } = req.query;
  const sql = 'select * from biographical_notes where userId = ?';
  const { err, rows } = await db.async.all(sql, [+userId]);
  if (err) {
    return res.cc(err);
  };

  res.send({
    status: 0,
    data: rows[0] ? rows[0] : 0,
  })
}

exports.addDeliver = async (req, res) => {
  const { positionId, bnId, state = 0, time } = req.body;
  const sql = 'select * from bn_deliver where positionId = ? and bnId = ?';
  const { rows = [] } = await db.async.all(sql, [positionId, bnId]);
  if (rows.length === 1) {
    return res.cc('您已申请过了，请勿重复申请！');
  };

  const sql2 = 'insert into  bn_deliver(positionId, bnId, state, time) values(?,?,?,?)';
  const { err, rows: rows2 } = await db.async.all(sql2, [positionId, bnId, state, time]);
  if (err) {
    return res.cc(err);
  };

  res.cc("投递成功！", 0);
}

exports.getDeliverCount = async (req, res) => {
  const { userId } = req.query;
  const sql = 'select count(*) as total from biographical_notes a, bn_deliver b where a.userId = ? and a.id = b.bnId and b.state = 0';
  const { err, rows } = await db.async.all(sql, [+userId]);
  if (err) {
    return res.cc(err);
  };

  const sql2 = 'select count(*) as total from biographical_notes a, bn_deliver b where a.userId = ? and a.id = b.bnId and b.state = 1';
  const { rows: rows2 } = await db.async.all(sql2, [+userId]);

  const sql3 = 'select count(*) as total from biographical_notes a, bn_deliver b where a.userId = ? and a.id = b.bnId and b.state = 2';
  const { rows: rows3 } = await db.async.all(sql3, [+userId]);

  const sql4 = 'select count(*) as total from biographical_notes a, bn_deliver b where a.userId = ? and a.id = b.bnId and b.state = 3';
  const { rows: rows4 } = await db.async.all(sql4, [+userId]);

  res.send({
    status: 0,
    data: {
      one: rows[0] ? rows[0].total : 0,
      two: rows2[0] ? rows2[0].total : 0,
      three: rows3[0] ? rows3[0].total : 0,
      four: rows4[0] ? rows4[0].total : 0,
    },
  })
}

// 企业用户注册
exports.regUserCompany = async (req, res) => {
  const { phone, password, realName, companyId } = req.body;
  const sql = 'select * from user where phone = ? and type = 1';
  const { err, rows } = await db.async.all(sql, [phone]);
  if (err) {
    return res.cc(err);
  };

  if (rows.length > 0) {
    return res.cc('该手机号以被注册！');
  };

  const newPassword = bcrypt.hashSync(password, 3);
  const pic = 'http://localhost:3007/images/default.png';
  const sql2 = 'insert into user (realName,password,phone,companyId,type,pic) values(?,?,?,?,?,?)';
  const { err: err2, rows: row2 } = await db.async.all(sql2, [realName, newPassword, phone, companyId, 1, pic]);
  if (err2) {
    return res.cc(err2)
  }
  if (row2.affectedRows !== 1) {
    return res.cc('注册用户失败，请稍后再试！')
  }

  res.cc('注册成功！', 0);
}

