const db = require('../db/index');

// 主页热门岗位的tab
exports.getMainPositionTabs = (req, res) => {
  const sql = 'select * from trade where fatherId = 0 limit 5';
  db.query(sql, (err, results) => {
    if (err) {
      return res.cc(err);
    }
    res.send({
      status: 0,
      data: results,
    });
  });
};

// 主页热门推荐岗位
exports.getPositionList = (req, res) => {
  const { tradeId } = req.query;
  const sql = 'select id from trade where fatherId = ?';
  db.query(sql, tradeId, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    const includes = [];
    results.forEach((item) => {
      includes.push(item.id);
    });
    const str = includes.join();
    const sql2 = 'select a.id, a.name, a.salaryLow, a.salaryUp, a.salaryNumber, a.salaryType, b.pic, b.shortName, b.territory from position_details a, company b where a.tradeId in (' + str + ') and a.companyId = b.id order by a.hotNumber desc limit 6';
    db.query(sql2, (err, results) => {
      if (err) {
        return res.cc(err);
      }
      res.send({
        status: 0,
        data: results,
      });
    });
  });
};

// 主页面推荐岗位的要求列表
exports.getPositionDescribeList = (req, res) => {
  const { positionId } = req.query;
  const type = 0;
  const sql = 'select * from position_describe where positionId = ? and type = ?';
  db.query(sql, [positionId, type], (err, results) => {
    if (err) {
      return res.cc(err);
    };
    res.send({
      status: 0,
      data: results,
    });
  });
};

// 热门城市
exports.getHotCity = (req, res) => {
  const sql = 'select * from city where fatherId != 0 order by hotCount desc limit 6';
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

// 热门岗位
exports.getHotPosition = (req, res) => {
  const sql = 'select * from trade where fatherId != 0 order by hotCount desc limit 6';
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

// 所以城市
exports.getAllCity = (req, res) => {
  const sql = 'select id as value, name as label from city where fatherId = 0';
  db.query(sql, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    let fatherList = results;
    fatherList = fatherList.map((item => {
      const sql2 = 'select name as value, name as label from city where fatherId = ?';
      db.query(sql2, item.value, (err, results) => {
        if (err) {
          return res.cc(err);
        };
        item.children = results;
      });
      return item;
    }))
    setTimeout(() => {
      res.send({
        status: 0,
        data: results,
      });
    }, 200);
  });
};

// 所以职位
exports.getAllPosition = (req, res) => {
  const sql = 'select id as value, name as label from trade where fatherId = 0';
  db.query(sql, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    let fatherList = results;
    fatherList = fatherList.map((item => {
      const sql2 = 'select id as value, name as label from trade where fatherId = ?';
      db.query(sql2, item.value, (err, results) => {
        if (err) {
          return res.cc(err);
        };
        item.children = results;
      });
      return item;
    }))
    setTimeout(() => {
      res.send({
        status: 0,
        data: results,
      });
    }, 200);
  });
};

// 薪资范围
exports.getAllSalary = (req, res) => {
  const sql = 'select id as value, name as label, low, up from salary';
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

// 热门城市的列表
exports.selectHotACity = (req, res) => {
  const { city } = req.query;
  const sql = 'select  a.id, a.name, a.salaryLow, a.salaryUp, c.content from position_details a left join position_describe c on a.id = c.positionId, position_address b, company d where a.id = b.positionId and a.companyId = d.id and b.city = ?';
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

// 筛选职位
exports.selectPosition = async (req, res) => {
  const { positionList = [], cityList = [], salaryLow = 0, salaryUp = 100, hotCity = '', hotPosition = '', page = 1, pageCount = 5, name = "" } = req.query;
  const sql = 'select a.id, a.name, a.salaryLow, a.salaryUp, a.companyId, a.salaryType, b.pic, b.shortName, b.territory, b.finance, b.employeeNum from position_details a, company b, position_address c where a.companyId = b.id and a.id = c.positionId and a.type != 4 ';
  let positionStr = '';
  let cityStr = '';
  hotCity !== '' && cityList.push(hotCity);
  hotPosition !== '' && positionList.push(hotPosition);
  const salaryStr = ` and a.salaryLow <= ${salaryUp} and a.salaryUp >= ${salaryLow} `;
  const nameStr = ` and a.name like '%${name}%' `
  if (positionList.length) {
    positionStr = ' and a.tradeId in ( ' + positionList.join(',') + ' ) '
  }
  if (cityList.length) {
    cityStr = " and c.city in ( '" + cityList.join("','") + "' ) "
  }
  const start = (page - 1) * pageCount;
  const limitStr = ` order by a.time desc limit ${start},${pageCount} `;
  const totalStr = sql + salaryStr + positionStr + cityStr + nameStr + limitStr;

  const { err, rows } = await db.async.all(totalStr, []);
  if (err) {
    return res.cc(err);
  }

  const sql2 = 'select count(*) as total from position_details a, company b, position_address c where a.companyId = b.id and a.id = c.positionId'
  const str2 = sql2 + salaryStr + positionStr + cityStr + nameStr;
  const { err: err2, rows: rows2 } = await db.async.all(str2, []);

  res.send({
    status: 0,
    data: rows,
    total: rows2[0].total,
  });

};

// 职位描述
exports.selectPositionDes = async (req, res) => {
  const { id, companyId = 0 } = req.query;
  const sql1 = 'select id, content from position_describe where positionId = ? and type = 0';
  const { err: err1, rows: message } = await db.async.all(sql1, [id]);
  const sql2 = 'select id, content from position_describe where positionId = ? and type = 1';
  const { err: err2, rows: describe } = await db.async.all(sql2, [id]);
  const sql3 = 'select id, content from company_treatment where companyId = ?';
  const { err: err3, rows: treatment } = await db.async.all(sql3, [companyId]);
  res.send({
    status: 0,
    data: {
      message,
      describe,
      treatment,
    }
  })
}

// 推荐岗位
exports.recommendPosition = async (req, res) => {
  const { userId = 0 } = req.query;
  const sql = 'select * from user where id = ?';
  const { err, rows = [] } = await db.async.all(sql, [userId]);
  if (err) {
    return res.cc(err);
  }
  let results2 = [];
  let results3 = [];
  if (+userId !== 0 || rows.length > 0) {
    const sql2 = 'select a.id, a.name, a.salaryLow, a.salaryUp, a.salaryType, a.companyId, b.pic, b.shortName, b.territory from position_details a, company b where a.companyId = b.id and a.tradeId = ? order by a.hotNumber desc limit 4';
    const { err: err2, rows: row2 } = await db.async.all(sql2, [rows[0].tradeId]);
    results2 = row2;
  }
  const sql3 = 'select a.id, a.name, a.salaryLow, a.salaryUp, a.salaryType, a.companyId, b.pic, b.shortName, b.territory from position_details a, company b where a.companyId = b.id order by a.hotNumber desc limit 2';
  const { err: err3, rows: row3 } = await db.async.all(sql3, []);
  results3 = row3;
  res.send({
    status: 0,
    data: results2.length > 0 ? results2 : results3,
  });
}

// 职位详情
exports.getDetails = async (req, res) => {
  const { positionId } = req.query;
  const sql = 'select a.id, a.companyId, a.name, a.salaryLow, a.salaryUp, a.salaryType, a.salaryNumber, a.p_describe, a.p_require, a.experience, a.tradeId, a.userId, b.shortName, b.introduction, b.territory, b.pic, b.finance, b.employeeNum  from position_details a, company b where a.id = ? and a.companyId = b.id';
  const { err, rows } = await db.async.all(sql, [positionId]);
  if (err) {
    return res.cc(err);
  };
  res.send({
    status: 0,
    data: rows[0],
  });
}

// hr信息
exports.getAHrMessage = async (req, res) => {
  const { userId } = req.query;
  const sql = 'select a.pic, a.realName, a.id, b.name from user a left join user_position b on a.id = b.userId where a.id = ?';
  const { err, rows } = await db.async.all(sql, [userId]);
  if (err) {
    return res.cc(err);
  };
  res.send({
    status: 0,
    data: rows[0],
  });
}

// position地址
exports.getAddress = async (req, res) => {
  const { positionId } = req.query;
  const sql = 'select id, fullAddress from position_address where positionId = ?';
  const { err, rows } = await db.async.all(sql, [positionId]);
  if (err) {
    return res.cc(err);
  };
  res.send({
    status: 0,
    data: rows,
  });
}

// 评论列表
exports.getPositionComment = async (req, res) => {
  const { moduleId } = req.query;
  const sql = 'select a.userId, a.id, a.time, a.title, a.content, a.like, a.pic as image, b.userName, b.pic as userPic from comment a, user b where a.moduleId = ? and a.userId = b.id order by a.like desc limit 3';
  const { err, rows } = await db.async.all(sql, [+moduleId]);
  if (err) {
    return res.cc(err);
  };
  res.send({
    status: 0,
    data: rows,
  });
}

exports.getAllPt = async (req, res) => {
  const sql = "select * from trade where fatherId != 0";
  const { err, rows } = await db.async.all(sql, []);
  if (err) {
    return res.cc(err);
  };
  res.send({
    status: 0,
    data: rows,
  });
};

exports.getPositionDeliver = async (req, res) => {
  const { userId, state = 0, page = 1, pageCount = 5 } = req.query;
  const start = (page - 1) * pageCount;
  const sql = "select a.time, c.id, c.name, c.salaryLow, c.salaryUp, c.salaryType, d.shortName, e.pic, e.userName, f.name as pName from bn_deliver a, biographical_notes b, position_details c, company d, user e left join user_position f on e.id = f.userId where a.state = ? and b.userId = ? and a.bnId = b.id and a.positionId = c.id and c.companyId = d.id and c.userId = e.id order by a.time limit ?,?";
  const { err, rows } = await db.async.all(sql, [state, +userId, start, +pageCount]);
  if (err) {
    return res.cc(err);
  };

  res.send({
    status: 0,
    data: rows,
  });
};

// 后台

exports.getManagePosition = async (req, res) => {
  const { userId, state = 0, page = 1, pageCount = 5 } = req.query;
  const start = (page - 1) * pageCount;
  let typeStr = '';
  const limitStr = ' order by time desc limit ?,?';
  const pSql = 'select * from  position_details where userId = ? ';
  if (+state !== 0) {
    typeStr = ` and type = ${state} `;
  }
  const sql = pSql + typeStr + limitStr;
  const { err, rows } = await db.async.all(sql, [+userId, start, +pageCount]);
  if (err) {
    return res.cc(err);
  };

  const pSql2 = 'select count(*) as total from  position_details where userId = ? '
  const sql2 = pSql2 + typeStr;
  const { rows: rows2 } = await db.async.all(sql2, [+userId]);

  res.send({
    status: 0,
    data: rows,
    total: rows2?.[0]?.total || 0,
  });
}

exports.getNotesCount = async (req, res) => {
  const { userId, page = 1, pageCount = 5 } = req.query;
  const start = (page - 1) * pageCount;
  const limitStr = ' order by b.time desc limit ?,?';
  const pSql = 'select a.name, a.count, a.id, b.state from  position_details a, bn_deliver b where a.userId = ? and a.id = b.positionId ';
  const sql = pSql + limitStr;
  const { err, rows } = await db.async.all(sql, [+userId, start, +pageCount]);
  if (err) {
    return res.cc(err);
  };

  let list = [];
  let ob = {};

  rows.map((item) => {
    if (!ob[`${item.id}`]) {
      ob[`${item.id}`] = item;
      ob[`${item.id}`].deliverCount = 0;
      ob[`${item.id}`].passCount = 0;
      ob[`${item.id}`].rejectCount = 0;
      ob[`${item.id}`].unreadCount = 0;
      ob[`${item.id}`].interviewCount = 0;
    }
    ob[`${item.id}`].deliverCount += 1;
    if (+item.state === 0) {
      ob[`${item.id}`].unreadCount += 1;
    } else if (+item.state === 2) {
      ob[`${item.id}`].passCount += 1;
    } else if (+item.state === 3) {
      ob[`${item.id}`].rejectCount += 1;
    } else if (+item.state === 3) {
      ob[`${item.id}`].interviewCount += 1;
    }
  });

  for (let i in ob) {
    list.push(ob[i]);
  };


  res.send({
    status: 0,
    data: list
  });
}

exports.getManageNotes = async (req, res) => {
  const { state = 0, page = 1, pageCount = 5, id } = req.query;
  const start = (page - 1) * pageCount;
  let typeStr = ` and b.state = ${+state} `;
  const limitStr = ' order by b.time desc limit ?,?';
  const pSql = 'select b.id, c.name as bName, c.path,  d.realName, d.age, d.phone, d.school  from  position_details a, bn_deliver b, biographical_notes c, user d where a.id = ? and a.id = b.positionId and c.id = b.bnId and c.userId = d.id ';
  if (+state === 0 || +state === 1) {
    typeStr = ' and ( b.state = 0 or b.state = 1) ';
  }
  const sql = pSql + typeStr + limitStr;
  const { err, rows } = await db.async.all(sql, [+id, start, +pageCount]);
  if (err) {
    return res.cc(err);
  };

  const pSql2 = 'select count(*) as total from  position_details a, bn_deliver b, biographical_notes c, user d where a.id = ? and a.id = b.positionId and c.id = b.bnId and c.userId = d.id '
  const sql2 = pSql2 + typeStr;
  const { rows: rows2 } = await db.async.all(sql2, [+id]);

  res.send({
    status: 0,
    data: rows,
    total: rows2?.[0]?.total || 0,
  });
}

exports.changeManageANotes = async (req, res) => {
  const { id, state } = req.body;
  const sql = 'update bn_deliver set state = ? where id = ?';
  const { err, rows } = await db.async.all(sql, [+state, +id]);
  if (err) {
    return res.cc(err);
  };

  res.cc('修改成功！', 0);
}

exports.addPosition = async (req, res) => {
  const { desTypeOne, desTypeTwo, province, cityName, fullAddress, companyId, name, salaryLow, salaryUp, salaryNumber, p_describe, p_require, experience, tradeId, time, userId, type, startTime, endTime, isSchool, count, salaryType } = req.body;
  const sql = 'insert into position_details (companyId, name, salaryLow, salaryUp, salaryNumber, p_describe, p_require, experience, tradeId, time, userId, type, startTime, endTime, isSchool, count, salaryType) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
  const { err, rows } = await db.async.all(sql, [companyId, name, salaryLow, salaryUp, salaryNumber, p_describe, p_require, experience, tradeId, time, userId, type, startTime, endTime, isSchool, count, salaryType]);
  if (err) {
    return res.cc(err);
  };
  const sql2 = 'select id from position_details';
  const { rows: rows2 } = await db.async.all(sql2, []);
  const positionId = rows2[rows2?.length - 1]?.id || 1;

  const sql3 = 'insert into position_address(positionId, province, city, fullAddress) values(?,?,?,?)';
  const { rows: rows3 } = await db.async.all(sql3, [positionId, province, cityName, fullAddress]);

  const sql4 = 'insert into position_describe(positionId, content, type) values(?,?,?)';
  desTypeOne.map(async (item) => {
    let { rows: rows4 } = await db.async.all(sql4, [positionId, item, 0]);
  });
  desTypeTwo.map(async (item) => {
    let { rows: rows5 } = await db.async.all(sql4, [positionId, item, 1]);
  });

  res.cc('添加成功', 0);
}

exports.getPositionDetails = async (req, res) => {
  const { id } = req.query;
  const sql = 'select * from position_details  where id = ?';
  const { err, rows } = await db.async.all(sql, [+id]);
  if (err) {
    return res.cc(err);
  };

  const sql2 = 'select * from position_describe where type = ? and positionId = ?';
  const { rows: desTypeOne } = await db.async.all(sql2, [0, +id]);
  const { rows: desTypeTwo } = await db.async.all(sql2, [1, +id]);

  const sql3 = 'select city as cityName, province, fullAddress from position_address where positionId = ?';
  const { rows: row3 } = await db.async.all(sql3, [+id]);

  res.send({
    status: 0,
    data: {
      ...rows[0],
      ...row3[0],
    },
    desTypeOne,
    desTypeTwo,
  });
}

exports.updatePosition = async (req, res) => {
  const { desTypeOne, desTypeTwo, province, cityName, fullAddress, id, companyId, name, salaryLow, salaryUp, salaryNumber, p_describe, p_require, experience, tradeId, time, userId, type, startTime, endTime, isSchool, count, salaryType } = req.body;
  console.log(req.body);
  const sql = 'update position_details set companyId = ?, name = ?, salaryLow = ?, salaryUp = ?, salaryNumber = ?, p_describe = ?, p_require = ?, experience = ?, tradeId = ?, time = ?, userId = ?, type = ?, startTime = ?, endTime = ?, isSchool = ?, count = ?, salaryType = ? where id = ?';
  const { err, rows } = await db.async.all(sql, [+companyId, name, +salaryLow, +salaryUp, +salaryNumber, p_describe, p_require, experience, +tradeId, time, +userId, type, startTime, endTime, +isSchool, +count, +salaryType, id]);
  if (err) {
    return res.cc(err);
  };

  const sql2 = 'update position_address set province = ?, city = ?, fullAddress = ? where positionId = ?';
  const { rows: row2 } = await db.async.all(sql2, [province, cityName, fullAddress, id]);

  const sql3 = 'update position_describe set content = ? where id = ?';
  desTypeOne.map(async (item) => {
    let { rows: row3 } = await db.async.all(sql3, [item.content, item.id]);
    return item;
  });
  desTypeTwo.map(async (item) => {
    let { rows: row3 } = await db.async.all(sql3, [item.content, item.id]);
    return item;
  });

  res.cc('修改成功！', 0);
}

