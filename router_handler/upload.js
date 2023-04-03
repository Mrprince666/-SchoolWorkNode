const db = require('../db/index');
const fs = require('fs');

exports.uploadHeadeImage = (req, res) => {
  const { imgData, id } = req.body;
  if (imgData) {
    //过滤data:URL
    const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = new Buffer.from(base64Data, 'base64');
    // 存储文件命名是使用当前时间，防止文件重名
    const saveUrl = "../public/images/" + (new Date()).getTime() + ".png";
    fs.writeFile(saveUrl, dataBuffer, (err) => {
      if (err) {
        return res.cc(err);
      } else {
        const sql = 'update user set pic = ? where id = ?';
        const url = 'http://localhost:3007' + saveUrl.slice(9);
        db.query(sql, [url, id], (err, results) => {
          if (err) {
            return res.cc(err);
          }
          if (results.affectedRows !== 1) {
            return res.cc('上传失败');
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