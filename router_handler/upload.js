const db = require('../db/index');
const fs = require('fs');
const path = require('path');

exports.uploadHeadeImage = (req, res) => {
  const { imgData, id } = req.body;
  if (imgData) {
    //过滤data:URL
    const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = new Buffer.from(base64Data, 'base64');
    // 存储文件命名是使用当前时间，防止文件重名
    const saveUrl = "./public/images/" + (new Date()).getTime() + ".png";
    fs.writeFile(saveUrl, dataBuffer, (err) => {
      if (err) {
        return res.cc(err);
      } else {
        const sql = 'update user set pic = ? where id = ?';
        const url = 'http://localhost:3007' + saveUrl.slice(8);
        db.query(sql, [url, id], (err, results) => {
          if (err) {
            return res.cc(err);
          }
          if (results.affectedRows !== 1) {
            return res.cc("上传失败");
          }
          return res.send({
            status: 0,
            data: url
          });
        })
      }
    })
  }
};

exports.uploadFile = (req, res) => {
  res.setHeader('Content-Type', 'multipart/form-data;charset=utf-8');

  const { userId, fileName } = req.body;

  //获取上传文件的 文件名、绝对路径
  const { originalname } = req.file
  const paths = req.file.path
  const extname = path.extname(originalname) //获取文件的扩展名
  let name = Date.now() + extname //新名字
  let newPath = path.join(__dirname, "../public/file/") + name //新路径
  fs.rename(paths, newPath, async (err) => {   //通过fs模块的rename方法 重新修改文件名
    if (err) return res.send({ message: '上传错误', status: 1 })

    const sql = "select * from  biographical_notes where userId = ?"
    const { err: err1, rows } = await db.async.all(sql, [+userId]);

    const url = 'http://localhost:3007/file/' + name;
    let sql2 = '';

    if (rows.length) {
      sql2 = 'update biographical_notes set name = ?, path = ? where userId = ?';
    } else {
      sql2 = 'insert into biographical_notes(name, path, userId) values(?,?,?)';
    }
    const { err: err2, rows: row2 } = await db.async.all(sql2, [fileName, url, +userId]);

    res.send({
      message: '上传成功',
      status: 0,
      data: {
        path: url,
        name: fileName,
      },
    })
  })
}