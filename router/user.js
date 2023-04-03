const express = require('express');
const expressJoi = require('@escook/express-joi');
const user_headler = require('../router_handler/user');


const router = express.Router();

const { reg_login_schema, reg_register_schema } = require('../schema/user');

router.post('/register', user_headler.regUser);

router.post('/login', user_headler.login);


module.exports = router;