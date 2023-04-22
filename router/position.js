const express = require('express');
const router = express.Router();
const { getMainPositionTabs, getPositionList,
  getPositionDescribeList, getHotCity, getHotPosition,
  getAllCity, getAllPosition, getAllSalary, selectPosition, selectPositionDes,
  recommendPosition, getDetails, getAHrMessage, getAddress, getPositionComment,
  getAllPt, getPositionDeliver, getManagePosition, getNotesCount, getManageNotes,
  changeManageANotes, addPosition, getPositionDetails, updatePosition
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

router.get('/selectPosition', selectPosition);
router.get('/selectPositionDes', selectPositionDes);
router.get('/recommendPosition', recommendPosition);

router.get('/getDetails', getDetails);
router.get('/getAHrMessage', getAHrMessage);
router.get('/getAddress', getAddress);
router.get('/getPositionComment', getPositionComment);
router.get('/getAllPt', getAllPt);

router.get('/getPositionDeliver', getPositionDeliver);
router.get('/getManagePosition', getManagePosition);
router.get('/getNotesCount', getNotesCount);
router.get('/getManageNotes', getManageNotes);
router.post('/changeManageANotes', changeManageANotes);
router.post('/addPosition', addPosition);
router.get('/getPositionDetails', getPositionDetails);
router.post('/updatePosition', updatePosition);

module.exports = router;
