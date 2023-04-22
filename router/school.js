const express = require('express');
const router = express.Router();

const { getCompanyList, getActivityList, getActivityDestails, getMoonlightList,
  getManageActivity, getActivity, updateActivity, addActivity
} = require("../router_handler/school");

router.get("/getCompanyList", getCompanyList);
router.get("/getActivityList", getActivityList);
router.get("/getActivityDestails", getActivityDestails);
router.get("/getMoonlightList", getMoonlightList);
router.get("/getManageActivity", getManageActivity);
router.get("/getActivity", getActivity);
router.post("/updateActivity", updateActivity);
router.post("/addActivity", addActivity);

module.exports = router;