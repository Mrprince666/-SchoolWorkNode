const express = require('express');
const router = express.Router();
const { getChatUserList, getOtherUserInfo, getPositionInfo, getChatList, addChatMessage } = require('../router_handler/chat');

router.get('/getUserList', getChatUserList);
router.get('/getuserInfo', getOtherUserInfo);
router.get('/getPositionInfo', getPositionInfo);
router.get('/getChatList', getChatList);
router.post('/addChatMessage', addChatMessage);

module.exports = router;