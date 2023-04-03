const joi = require('joi');

//定义手机号和密码验证规则
const phone = joi.string().min(13).max(13).required();
const password = joi.string().pattern(/^[\S]{6,12}$/).required();

const id = joi.number().integer().min(1).required()
const email = joi.string().email();
const userName = joi.string().alphanum().min(1).max(10).required();
const pic = joi.string().dataUri().required()
const age = joi.number().integer().min(1).required();

exports.reg_login_schema = {
  body: {
    phone,
    password,
  }
}

exports.reg_register_schema = {
  body: {
    phone,
    password,
    userName,
  }
}


//验证规则对象-更新密码
exports.update_password_schema = {
  body: {
    oldPwd: password,
    newPwd: joi.not(joi.ref('oldPwd')).concat(password),
  }
}


//验证规则对象-更新头像
exports.update_avatar_schema = {
  body: {
    pic,
  }
}