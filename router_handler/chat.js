const db = require('../db/index');

// 获取聊天联系人
exports.getChatUserList = (req, res) => {
  const { userId } = req.query;
  const sql = 'select a.id, a.oneId, a.otherId, a.positionId, a.time, a.isTopping, b.message from chatroom a  left join chat_message b on b.chatroomId = a.id and b.time = a.time where a.oneId = ? or a.otherId = ?  order by a.isTopping desc, a.time desc';
  db.query(sql, [userId, userId], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results,
    });
  })
};

// 获取对方的信息
exports.getOtherUserInfo = (req, res) => {
  const { otherId } = req.query;
  const sql = 'select a.pic, a.userName, b.shortName, c.name as position from (user a left join company b on a.companyId = b.id) left join user_position c on a.id = c.userId  where a.id = ?';
  db.query(sql, otherId, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results[0],
    });
  })
};

// 获取岗位信息
exports.getPositionInfo = (req, res) => {
  const { positionId } = req.query;
  const sql = 'select a.name, a.salaryLow, a.salaryUp, b.city from position_details a left join position_address b on a.id = b.positionId where a.id = ?';
  db.query(sql, positionId, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results[0],
    });
  });
};

// 获取聊天信息列表
exports.getChatList = (req, res) => {
  const { chatroomId } = req.query;
  const sql = 'select * from chat_message where chatroomId = ?';
  db.query(sql, chatroomId, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results,
    });
  });
};

// 添加聊天信息
exports.addChatMessage = (req, res) => {
  const { chatroomId, message, userId, time } = req.body;
  const sql = 'insert into chat_message(chatroomId, message, userId, time) values(?, ?, ?, ?)';
  db.query(sql, [chatroomId, message, userId, time], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    if (results.affectedRows !== 1) {
      return res.cc('发送失败');
    }
    const sql3 = 'update chatroom set time=? where id =?';
    db.query(sql3, [time, chatroomId], (err, results) => {
      if (err) {
        return res.cc(err);
      }
    })
    const sql2 = 'select * from chat_message where userId = ? and time = ?'
    db.query(sql2, [userId, time], (err, results) => {
      if (err) {
        return res.cc(err);
      }
      return res.send({
        status: 0,
        data: results[0],
      })
    })
  });
};
