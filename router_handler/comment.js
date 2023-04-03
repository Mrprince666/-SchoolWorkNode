const db = require('../db/index');

// 添加评论
exports.addCommnet = (req, res) => {
  const comment = req.body;
  const sql = 'insert into comment(userId, time, title, content) values(?,?,?,?)'
  db.query(sql, [comment.userId, comment.time, comment.title, comment.content], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    if (results.affectedRows !== 1) {
      return res.cc('发表失败');
    }
    return res.cc('发表成功', 0);
  })
};

// 主页精选评论
exports.selectList = (req, res) => {
  const sql = 'select b.userName, b.pic, c.name, a.id, a.like, a.time, a.userId, a.title, a.content, a.moduleId  from comment a, user b, user_position c where a.userId = b.id and c.userId = b.id order by a.like desc limit 3';
  db.query(sql, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results,
    });
  });
};

// 是否点赞
exports.getGood = (req, res) => {
  const data = req.body;
  const sql = 'select * from comment_good where userId=? and commentId=?';
  db.query(sql, [data.userId, data.commentId], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results.length === 1 ? 1 : 0,
    });
  });
}

// 添加点赞
exports.addGood = (req, res) => {
  const data = req.body;
  const sql = 'insert into comment_good(userId, commentId) values(?,?)';
  db.query(sql, [data.userId, data.commentId], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    if (results.affectedRows !== 1) {
      return res.cc('点赞失败');
    }
    const sql2 = 'update comment set `like`=`like`+1 where id = ?';
    db.query(sql2, data.commentId, (err, results) => {
      if (err) {
        return res.cc(err);
      };
      if (results.affectedRows !== 1) {
        return res.cc('点赞失败');
      }
      return res.cc('点赞成功！', 0);
    });
  });
}

// 取消点赞
exports.deleteGood = (req, res) => {
  const data = req.body;
  const sql = 'delete from comment_good where userId=? and commentId=?';
  db.query(sql, [data.userId, data.commentId], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    if (results.affectedRows !== 1) {
      return res.cc('取消失败');
    }
    const sql2 = 'update comment set `like`=`like`-1 where id = ?';
    db.query(sql2, data.commentId, (err, results) => {
      if (err) {
        return res.cc(err);
      };
      if (results.affectedRows !== 1) {
        return res.cc('取消失败');
      }
      return res.cc('取消成功！', 0);
    });
  });
}

// 收藏
exports.getCollect = (req, res) => {
  const data = req.body;
  const sql = 'select * from comment_collect where userId=? and commentId=?';
  db.query(sql, [data.userId, data.commentId], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results.length === 1 ? 1 : 0,
    });
  });
}

// 添加收藏
exports.addCollect = (req, res) => {
  const data = req.body;
  const sql = 'insert into comment_collect(userId, commentId) values(?,?)';
  db.query(sql, [data.userId, data.commentId], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    if (results.affectedRows !== 1) {
      return res.cc('收藏失败');
    }
    return res.cc('收藏成功！', 0);
  });
}

// 取消收藏
exports.deleteCollect = (req, res) => {
  const data = req.body;
  const sql = 'delete from comment_collect where userId=? and commentId=?';
  db.query(sql, [data.userId, data.commentId], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    if (results.affectedRows !== 1) {
      return res.cc('取消失败');
    }
    return res.cc('取消成功！', 0);
  });
}

// 获取单个发表文章
exports.selectACommnet = (req, res) => {
  const { id } = req.query;
  const sql = 'select b.userName, b.pic, c.name, a.id, a.like, a.time, a.userId, a.title, a.content, a.moduleId  from comment a, user b left join user_position c on c.userId = b.id where a.id = ? and a.userId = b.id';
  db.query(sql, id, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results[0],
    });
  });
}

// 获取详情的回复
exports.selectReply = (req, res) => {
  const { id, page, pageSize } = req.query;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const sql = 'select a.id, a.userId, a.content, a.time, b.pic, b.userName from reply a, user b where a.commentId = ? and a.userId = b.id order by a.time desc';
  db.query(sql, id, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      total: results.length,
      data: results.slice(start, end),
    });
  });
}

// 添加回复
exports.addReply = (req, res) => {
  const { message, userId, commentId, time } = req.body;
  const sql = 'insert into reply(userId, commentId, time, content) values(?,?,?,?)';
  db.query(sql, [userId, commentId, time, message], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results,
    });
  });
}

// 删除回复
exports.deleteReply = (req, res) => {
  const { id } = req.body;
  const sql = 'delete from reply where id = ?';
  db.query(sql, id, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.cc('删除成功！', 0);
  });
}

// 广场评论(按时间)
exports.getComment = (req, res) => {
  const { type, page, pageCount } = req.query;
  const start = (page - 1) * pageCount;
  const sql = `select b.userName, b.pic, c.name, a.id, a.like, a.time, a.userId, a.title, a.content, a.moduleId  from comment a, user b left join user_position c on c.userId = b.id where a.userId = b.id order by  ${type == 0 ? 'a.like' : 'a.time'}  desc limit ?, ?`;
  db.query(sql, [start, +pageCount], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results,
    });
  });
}
