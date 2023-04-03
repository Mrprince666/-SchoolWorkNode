const express = require('express');
const router = express.Router();
const { getMainPositionTabs, getPositionList,
  getPositionDescribeList, getHotCity, getHotPosition,
  getAllCity, getAllPosition, getAllSalary
}
  = require('../router_handler/position');

router.get('/hotTabs', getMainPositionTabs);
router.get('/hotList', getPositionList);
router.get('/hotDescribeList', getPositionDescribeList);
router.get('/getHotCity', getHotCity);
router.get('/getHotPosition', getHotPosition);
router.get('/getAllCity', getAllCity);
router.get('/getAllPosition', getAllPosition);
router.get('/getAllSalary', getAllSalary);

module.exports = router;
