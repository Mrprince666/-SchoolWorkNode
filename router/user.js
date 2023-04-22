const express = require('express');
const expressJoi = require('@escook/express-joi');
const { regUser, login, getMyComment, getMyCollect,
  getMyInfo, updateMyInfo, updatePassword, getNotes, getDeliverCount,
  addDeliver, regUserCompany
} = require('../router_handler/user');


const router = express.Router();

const { reg_login_schema, reg_register_schema } = require('../schema/user');

router.post('/register', regUser);

router.post('/login', login);

router.get('/getMyComment', getMyComment);
router.get('/getMyCollect', getMyCollect);
router.get('/getMyInfo', getMyInfo);
router.post('/updateMyInfo', updateMyInfo);
router.post('/updatePassword', updatePassword);
router.get('/getNotes', getNotes);
router.get('/getDeliverCount', getDeliverCount);

router.post('/addDeliver', addDeliver);
router.post('/regUserCompany', regUserCompany);


module.exports = router;