const express = require('express');
const { addCommnet, selectList, getGood, addGood, deleteGood,
  getCollect, addCollect, deleteCollect, selectACommnet, selectReply,
  addReply, deleteReply, getComment }
  = require('../router_handler/comment');

const router = express.Router();

router.post('/addComment', addCommnet);

router.get('/choice', selectList);

// 点赞
router.post('/getGood', getGood);
router.post('/addGood', addGood);
router.post('/deleteGood', deleteGood);

// 收藏
router.post('/getCollect', getCollect);
router.post('/addCollect', addCollect);
router.post('/deleteCollect', deleteCollect);

router.get('/selectACommnet', selectACommnet);
router.get('/selectReply', selectReply);
router.post('/addReply', addReply);
router.post('/deleteReply', deleteReply);

router.get('/getComment', getComment);

module.exports = router;