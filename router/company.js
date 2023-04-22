const express = require('express');
const { getDetails, getHotCompanyList, getHotCompany,
  getCompanyPosition, getCompany, updateCompany, addAddress,
  deleteAddress, addTreatment, deleteTreatment, getAllCompany,
  addCompany
} = require('../router_handler/company');

const router = express.Router();

router.get('/getDetails', getDetails);
router.get('/getHotList', getHotCompanyList);
router.get('/getHotCompany', getHotCompany);
router.get('/getHotCompany', getHotCompany);
router.get('/getCompanyPosition', getCompanyPosition);
router.get('/getCompany', getCompany);
router.post('/updateCompany', updateCompany);
router.post('/addAddress', addAddress);
router.post('/deleteAddress', deleteAddress);
router.post('/addTreatment', addTreatment);
router.post('/deleteTreatment', deleteTreatment);
router.get('/getAllCompany', getAllCompany);
router.post('/addCompany', addCompany);


module.exports = router;
