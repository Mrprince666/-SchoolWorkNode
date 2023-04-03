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
    const sql2 = 'select a.id, a.name, a.salaryLow, a.salaryUp, a.salaryNumber, b.pic, b.shortName, b.territory from position a, company b where a.tradeId in (' + str + ') and a.companyId = b.id order by a.hotNumber desc limit 6';
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
      const sql2 = 'select id as value, name as label from city where fatherId = ?';
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
  const sql = 'select id as value, name as label from salary';
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
  const sql = 'select  a.id, a.name, a.salaryLow, a.salaryUp, c.content from position a left join position_describe c on a.id = c.positionId, position_address b, company d where a.id = b.positionId and a.companyId = d.id and b.city = ?';
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
