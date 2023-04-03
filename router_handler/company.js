const db = require('../db/index');

// 企业详情
exports.getDetails = (req, res) => {
  const id = req.query.id;
  const sql = 'select * from company where id=?'
  db.query(sql, id, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    if (results.length !== 1) {
      return res.cc('获取企业详情失败');
    }
    return res.send({
      status: 0,
      data: results
    });
  })
};

// 热门企业列表id
exports.getHotCompanyList = (req, res) => {
  const sql = 'select id from company order by hotNumber limit 6';
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

// 首页热门企业岗位
exports.getHotCompany = (req, res) => {
  const { companyId } = req.query;
  let companyInfo = {};
  let positionInfo = [];
  const sql = 'select id, pic, shortName, finance, employeeNum, territory from company where id = ?';
  db.query(sql, companyId, (err, results) => {
    if (err) {
      return res.cc(err);
    };
    companyInfo = results[0];

    const sql2 = 'select id, name, salaryLow, salaryUp from position where companyId = ? order by hotNumber desc limit 3';
    db.query(sql2, companyId, (err, results) => {
      if (err) {
        return res.cc(err);
      };
      positionInfo = results.map((item) => {
        const type = 0;
        const sql3 = 'select * from position_describe where positionId = ? and type = ?';
        db.query(sql3, [item.id, type], (err, results) => {
          item.describe = results;
        });
        return item;
      });
      setTimeout(() => {
        res.send({
          status: 0,
          data: {
            companyInfo,
            positionInfo,
          }
        })
      }, 200);
    });
  });
};