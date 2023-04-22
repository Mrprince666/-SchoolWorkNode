const db = require('../db/index');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// 企业详情
// exports.getDetails = (req, res) => {
//   const id = req.query.id;
//   const sql = 'select * from company where id=?'
//   db.query(sql, id, (err, results) => {
//     if (err) {
//       return res.cc(err);
//     };
//     if (results.length !== 1) {
//       return res.cc('获取企业详情失败');
//     }
//     return res.send({
//       status: 0,
//       data: results
//     });
//   })
// };

// 热门企业列表id
exports.getHotCompanyList = (req, res) => {
  const sql = 'select id from company order by hotNumber desc limit 6';
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

    const sql2 = 'select id, name, salaryLow, salaryUp, salaryType from position_details where companyId = ? order by hotNumber desc limit 3';
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

// 评论列表
exports.getDetails = async (req, res) => {
  const { companyId } = req.query;
  const sql = 'select * from company where id = ?';
  const { err, rows } = await db.async.all(sql, [+companyId]);
  if (err) {
    return res.cc(err);
  };
  const data = rows[0];
  const sql2 = 'select * from company_treatment where companyId = ?';
  const { rows: rows2 } = await db.async.all(sql2, [+companyId]);
  data.treatment = rows2;
  const sql3 = 'select * from company_address where companyId = ?';
  const { rows: rows3 } = await db.async.all(sql3, [+companyId]);
  data.address = rows3;
  const sql4 = 'select count(*) as total from position_details where companyId = ?';
  const { rows: rows4 } = await db.async.all(sql4, [+companyId]);
  data.total = rows4[0].total;

  const sql5 = 'select b.id, b.pic, b.userName, c.name from position_details a, user b left join user_position c on b.id = c.userId  where a.companyId = ? and a.userId = b.id';
  const { rows: rows5 } = await db.async.all(sql5, [+companyId]);
  let counter = {};
  let hrList = [];
  rows5.forEach((item) => {
    const key = JSON.stringify(item);
    counter[key] = (counter[key] || 0) + 1;
  });
  for (let i in counter) {
    let obj = {
      ...JSON.parse(i),
      num: counter[i],
    }
    hrList.push(obj);
  };
  data.hrList = hrList;

  const sql6 = 'select b.userName, b.pic, c.name, a.id, a.like, a.time, a.userId, a.title, a.content, a.moduleId  from comment a, user b left join user_position c on c.userId = b.id  where a.companyId = ? and a.userId = b.id order by a.like desc limit 5';
  const { rows: rows6 } = await db.async.all(sql6, [+companyId]);
  data.commentList = rows6;

  const sql7 = 'select id, city from company_address where companyId = ?';
  const { rows: rows7 } = await db.async.all(sql7, [+companyId]);
  data.allCity = rows7;

  const sql8 = 'select b.id, b.name from position_details a, trade b where a.companyId = ? and a.tradeId = b.id';
  const { rows: rows8 } = await db.async.all(sql8, [+companyId]);
  data.allPosition = rows8;

  const sql9 = 'select id as value, name as label, low, up from salary';
  const { rows: rows9 } = await db.async.all(sql9, []);
  data.allSalary = rows9;

  res.send({
    status: 0,
    data,
  });
}

exports.getCompanyPosition = async (req, res) => {
  const { companyId, type = 0, input = "", tradeId = '', city = '', salaryLow = 0, salaryUp = 100, page = 1, pageCount = 5 } = req.query;
  const sql = `select a.id, a.name, a.salaryLow, a.salaryUp, a.salaryType, c.userName, c.pic, d.name as pName from position_details a, position_address b, user c left join user_position d on c.id = d.userId where a.companyId = ${companyId} and a.id = b.positionId and a.userId = c.id `;
  let tradeStr = '';
  let cityStr = '';
  let inputStr = '';
  let typeStr = '';
  const salaryStr = ` and a.salaryLow <= ${+salaryUp} and a.salaryUp >= ${+salaryLow} `;
  const start = (page - 1) * pageCount;
  const limitStr = ` order by a.time limit ${start}, ${+pageCount}`;
  if (tradeId) {
    tradeStr = ` and a.tradeId = ${+tradeId} `;
  }
  if (city) {
    cityStr = ` and b.city = '${city}' `;
  }
  if (input) {
    inputStr = ` and a.name like '%${input}%' `;
  }
  if (+type !== 0) {
    typeStr = ` and a.type = ${+type} `;
  }
  const str = sql + tradeStr + cityStr + salaryStr + inputStr + typeStr + limitStr;
  const { err, rows } = await db.async.all(str, []);

  const countSql = `select count(*) as total from position_details a, position_address b, user c left join user_position d on c.id = d.userId where a.companyId = ${companyId} and a.id = b.positionId and a.userId = c.id `;
  const str2 = countSql + tradeStr + cityStr + salaryStr + inputStr + typeStr;
  const { rows: rows2 } = await db.async.all(str2, []);

  if (err) {
    return res.cc(err);
  }
  res.send({
    status: 0,
    data: rows,
    total: rows2[0].total,
  });
};

exports.getCompany = async (req, res) => {
  const { companyId } = req.query;
  const sql = 'select * from company where id = ?';
  const { err, rows } = await db.async.all(sql, [companyId]);
  if (err) {
    return res.cc(err);
  }

  const sql2 = 'select * from company_address where companyId = ?';
  const { rows: row2 } = await db.async.all(sql2, [companyId]);

  const sql3 = 'select * from company_treatment where companyId = ?';
  const { rows: row3 } = await db.async.all(sql3, [companyId]);

  res.send({
    status: 0,
    company: rows[0],
    addressList: row2,
    treatment: row3,
  });

};

exports.updateCompany = async (req, res) => {
  const { id, shortName, introduction, boss, fullName, startTime, type, startAddress, societyNumber, scope, workTimeStart, workTimeEnd, workTimeType, website, territory, finance, employeeNum, businessStatus, startMoney, pic, imgData } = req.body;
  const sql = 'update company set shortName = ?, introduction = ?, boss = ?, fullName = ?, startTime = ?, type = ?, startAddress = ?, societyNumber = ?, scope = ?, workTimeStart = ?, workTimeEnd = ?, workTimeType = ?, website = ?, territory = ?, finance = ?, employeeNum = ?, businessStatus = ?, startMoney = ?, pic = ? where id = ?';
  if (imgData) {
    const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = new Buffer.from(base64Data, 'base64');
    const saveUrl = "./public/images/" + (new Date()).getTime() + ".png";
    fs.writeFile(saveUrl, dataBuffer, async (err) => {
      if (err) {
        return res.cc(err);
      } else {
        const url = 'http://localhost:3007' + saveUrl.slice(8);
        const { err: err2, rows } = await db.async.all(sql, [shortName, introduction, boss, fullName, startTime, type, startAddress, societyNumber, scope, workTimeStart, workTimeEnd, workTimeType, website, territory, finance, employeeNum, businessStatus, startMoney, url, id]);
        if (err2) {
          return res.cc(err2);
        };
        if (rows.affectedRows !== 1) {
          return res.cc("修改失败");
        }

        res.cc('修改成功', 0);
      }
    })
  } else {
    const { err, rows } = await db.async.all(sql, [shortName, introduction, boss, fullName, startTime, type, startAddress, societyNumber, scope, workTimeStart, workTimeEnd, workTimeType, website, territory, finance, employeeNum, businessStatus, startMoney, pic, id]);
    if (err) {
      return res.cc(err);
    };
    if (rows.affectedRows !== 1) {
      return res.cc("修改失败");
    }

    res.cc('修改成功', 0);
  }
}

exports.addAddress = async (req, res) => {
  const { companyId, city, fullAddress } = req.body;
  const sql = 'insert into company_address(companyId, city, fullAddress) values(?,?,?)';
  const { err, rows } = await db.async.all(sql, [+companyId, city, fullAddress]);
  if (err) {
    return res.cc(err);
  }

  const sql2 = 'select * from company_address where companyId = ?';
  const { rows: rows2 } = await db.async.all(sql2, [+companyId]);

  res.send({
    status: 0,
    data: rows2,
    message: '添加成功',
  });
};

exports.deleteAddress = async (req, res) => {
  const { companyId, id } = req.body;
  const sql = 'delete from company_address where id = ?';
  const { err, rows } = await db.async.all(sql, [+id]);
  if (err) {
    return res.cc(err);
  }

  const sql2 = 'select * from company_address where companyId = ?';
  const { rows: rows2 } = await db.async.all(sql2, [+companyId]);

  res.send({
    status: 0,
    data: rows2,
    message: '删除成功',
  });
};

exports.addTreatment = async (req, res) => {
  const { companyId, content } = req.body;
  const sql = 'insert into company_treatment(companyId, content) values(?,?)';
  const { err, rows } = await db.async.all(sql, [+companyId, content]);
  if (err) {
    return res.cc(err);
  }

  const sql2 = 'select * from company_treatment where companyId = ?';
  const { rows: rows2 } = await db.async.all(sql2, [+companyId]);

  res.send({
    status: 0,
    data: rows2,
    message: '添加成功',
  });
};

exports.deleteTreatment = async (req, res) => {
  const { companyId, id } = req.body;
  const sql = 'delete from company_treatment where id = ?';
  const { err, rows } = await db.async.all(sql, [+id]);
  if (err) {
    return res.cc(err);
  }

  const sql2 = 'select * from company_treatment where companyId = ?';
  const { rows: rows2 } = await db.async.all(sql2, [+companyId]);

  res.send({
    status: 0,
    data: rows2,
    message: '删除成功',
  });
};

exports.getAllCompany = async (req, res) => {
  const { companyId, city, fullAddress } = req.body;
  const sql = 'select id, fullName from company';
  const { err, rows } = await db.async.all(sql, []);
  if (err) {
    return res.cc(err);
  }

  res.send({
    status: 0,
    data: rows,
  });
};

// 企业用户注册
exports.addCompany = async (req, res) => {
  const { phone, password, realName, shortName, fullName, societyNumber, employeeNum, boss, type } = req.body;
  const sql = 'select * from user where phone = ? and type = 1';
  const { err, rows } = await db.async.all(sql, [phone]);
  if (err) {
    return res.cc(err);
  };

  if (rows.length > 0) {
    return res.cc('该手机号以被注册！');
  };

  const pic = 'http://localhost:3007/images/default.png';
  const sql3 = 'insert into company(shortName, fullName, societyNumber, employeeNum, boss, type, pic) values(?,?,?,?,?,?,?)';
  const { err: err3, rows: row3 } = await db.async.all(sql3, [shortName, fullName, societyNumber, employeeNum, boss, type, pic]);
  if (err3) {
    return res.cc(err3);
  }

  const sql4 = 'select id from company order by id desc limit 1';
  const { rows: row4 } = await db.async.all(sql4, []);

  const companyId = row4?.[0]?.id || 1;

  const newPassword = bcrypt.hashSync(password, 3);
  const sql2 = 'insert into user (realName,password,phone,companyId,type,pic) values(?,?,?,?,?,?)';
  const { err: err2, rows: row2 } = await db.async.all(sql2, [realName, newPassword, phone, companyId, 1, pic]);
  if (err2) {
    return res.cc(err2);
  }
  if (row2.affectedRows !== 1) {
    return res.cc('注册用户失败，请稍后再试！')
  }

  res.cc('注册成功！', 0);
}
