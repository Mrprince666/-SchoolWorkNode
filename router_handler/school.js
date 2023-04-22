const db = require('../db/index');
const fs = require('fs');

exports.getCompanyList = async (req, res) => {
  const { page = 1, pageCount = 5 } = req.query;
  const start = (page - 1) * pageCount;
  const sql = "select a.id, a.pic, a.fullName, a.territory, b.time from company a, activity b where a.id = b.companyId order by b.time limit ?,?";
  const { err, rows } = await db.async.all(sql, [start, +pageCount]);
  if (err) {
    return res.cc(err);
  };

  const sql2 = "select count(*) as total from company a, activity b where a.id = b.companyId";
  const { rows: rows2 = [] } = await db.async.all(sql2, []);
  res.send({
    status: 0,
    data: rows,
    total: rows2[0].total,
  });
};

exports.getActivityList = async (req, res) => {
  const { page = 1, pageCount = 5 } = req.query;
  const start = (page - 1) * pageCount;
  const sql = "select id, title, startTime, endTime, place, pic from activity order by time limit ?,?";
  const { err, rows } = await db.async.all(sql, [start, +pageCount]);
  if (err) {
    return res.cc(err);
  };

  const sql2 = "select count(*) as total from activity";
  const { rows: rows2 = [] } = await db.async.all(sql2, []);
  res.send({
    status: 0,
    data: rows,
    total: rows2[0].total,
  });
};

exports.getActivityDestails = async (req, res) => {
  const { id } = req.query;
  const sql = "select a.id, a.companyId, a.title, a.startTime, a.endTime, a.place, a.contacts, a.website, a.email, a.telephone, a.pic, b.fullName, b.pic as cPic, b.introduction from activity a, company b where a.id = ? and a.companyId = b.id";
  const { err, rows } = await db.async.all(sql, [+id]);
  if (err || rows.length === 0) {
    return res.cc(err);
  };

  const data = rows[0];

  const sql2 = "select a.id, a.name, a.count, a.salaryLow, a.salaryUp, a.p_require, a.startTime, a.endTime, b.fullAddress  from position_details a, position_address b where a.isSchool = 1 and a.companyId = ? and a.id = b.positionId";
  const { rows: rows2 } = await db.async.all(sql2, [data.companyId]);
  data.positionList = rows2;

  res.send({
    status: 0,
    data,
  });
};


exports.getMoonlightList = async (req, res) => {
  const { page = 1, pageCount = 9 } = req.query;
  const start = (page - 1) * pageCount;
  const sql = "select a.id, a.name, a.salaryLow, a.salaryUp, a.salaryType, b.pic, b.fullName from position_details a, company b where a.companyId = b.id and a.type = 4 and a.isSchool = 1 order by a.time limit ?,?";
  const { err, rows } = await db.async.all(sql, [start, +pageCount]);
  if (err) {
    return res.cc(err);
  };

  const sql2 = "select count(*) as total from position a, company b where a.companyId = b.id and a.type = 4 and a.isSchool = 1";
  const { rows: rows2 = [] } = await db.async.all(sql2, []);

  res.send({
    status: 0,
    data: rows,
    total: rows2?.[0]?.total || 0,
  });
};

exports.getManageActivity = async (req, res) => {
  const { page = 1, pageCount = 5, companyId } = req.query;
  const start = (page - 1) * pageCount;
  const sql = 'select * from activity where companyId = ? order by time desc limit ?,?';
  const { err, rows } = await db.async.all(sql, [companyId, start, +pageCount]);
  if (err) {
    return res.cc(err);
  };
  const sql2 = "select count(*) as total from activity where companyId = ?";
  const { rows: rows2 = [] } = await db.async.all(sql2, []);

  res.send({
    status: 0,
    data: rows,
    total: rows2?.[0]?.total || 0,
  });
};

exports.getActivity = async (req, res) => {
  const { id } = req.query
  const sql = "select * from activity where id = ?";
  const { err, rows } = await db.async.all(sql, [id]);
  if (err) {
    return res.cc(err);
  };

  res.send({
    status: 0,
    data: rows[0],
  });
};

exports.updateActivity = async (req, res) => {
  const { id, title, startTime, endTime, place, contacts, website, email, telephone, pic, imgData } = req.body;
  const sql = 'update activity set title = ?, startTime = ?, endTime = ?, place = ?, contacts = ?, website = ?, email = ?, telephone = ?, pic = ?  where id = ?';
  if (imgData) {
    const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = new Buffer.from(base64Data, 'base64');
    const saveUrl = "./public/images/" + (new Date()).getTime() + ".png";
    fs.writeFile(saveUrl, dataBuffer, async (err) => {
      if (err) {
        return res.cc(err);
      } else {
        const url = 'http://localhost:3007' + saveUrl.slice(8);
        const { err: err2, rows } = await db.async.all(sql, [title, startTime, endTime, place, contacts, website, email, telephone, url, id]);
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
    const { err, rows } = await db.async.all(sql, [title, startTime, endTime, place, contacts, website, email, telephone, pic, id]);
    if (err) {
      return res.cc(err);
    };
    if (rows.affectedRows !== 1) {
      return res.cc("修改失败");
    }

    res.cc('修改成功', 0);
  }
}

exports.addActivity = async (req, res) => {
  const { title, startTime, endTime, place, contacts, website, email, telephone, companyId, time, pic, imgData } = req.body;
  const sql = 'insert into activity(title, startTime, endTime, place, contacts, website, email, telephone, companyId, time, pic) values(?,?,?,?,?,?,?,?,?,?,?)';
  if (imgData) {
    const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = new Buffer.from(base64Data, 'base64');
    const saveUrl = "./public/images/" + (new Date()).getTime() + ".png";
    fs.writeFile(saveUrl, dataBuffer, async (err) => {
      if (err) {
        return res.cc(err);
      } else {
        const url = 'http://localhost:3007' + saveUrl.slice(8);
        const { err: err2, rows } = await db.async.all(sql, [title, startTime, endTime, place, contacts, website, email, telephone, companyId, time, url]);
        if (err2) {
          return res.cc(err2);
        };
        if (rows.affectedRows !== 1) {
          return res.cc("添加失败");
        }

        res.cc('添加成功', 0);
      }
    })
  } else {
    const { err, rows } = await db.async.all(sql, [title, startTime, endTime, place, contacts, website, email, telephone, companyId, time, pic]);
    if (err) {
      return res.cc(err);
    };
    if (rows.affectedRows !== 1) {
      return res.cc("添加失败");
    }

    res.cc('添加成功', 0);
  }
}



