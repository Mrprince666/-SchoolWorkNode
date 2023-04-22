const express = require('express');
const app = express();
const joi = require('joi');
const cors = require('cors');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
  res.cc = (err, status = 1) => {
    res.send({
      status,
      message: err instanceof Error ? err.message : err
    })
  };
  next();
})

const expressJWT = require('express-jwt');
const config = require('./config');

app.use(express.static('public'));

// app.use(expressJWT({ secret: config.jwtSecretKey, algorithms: ['HS256'] }).unless({ path: [/^\/api/] }));

// 导入模块路由

const userRouter = require('./router/user');
app.use('/user', userRouter);

const commentRouter = require('./router/comment');
app.use('/comment', commentRouter);

const companyRouter = require('./router/company');
app.use('/company', companyRouter);

const positionRouter = require('./router/position');
app.use('/position', positionRouter);

const chatRouter = require('./router/chat');
app.use('/chat', chatRouter);

const schoolRouter = require('./router/school');
app.use('/school', schoolRouter);

const uploadRouter = require('./router/upload');
app.use('/upload', uploadRouter);

// 定义错误级别的中间件
app.use((err, req, res, next) => {
  if (err instanceof joi.ValidationError) {
    return res.cc(err);
  };

  if (err.name === 'UnauthorizedError') {
    return res.cc('身份认证失败');
  };

  //未知错误
  res.send({
    status: 1,
    message: err,
  })
})

app.listen(3007, () => {
  console.log('api server running at http://127.0.0.1:3007');
});