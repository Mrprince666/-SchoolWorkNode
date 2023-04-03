const express = require('express');
const { getDetails, getHotCompanyList, getHotCompany } = require('../router_handler/company');

const router = express.Router();

router.get('/details', getDetails);
router.get('/getHotList', getHotCompanyList);
router.get('/getHotCompany', getHotCompany);

module.exports = router;
