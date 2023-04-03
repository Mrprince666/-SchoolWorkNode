const express = require('express');
const router = express.Router();
const { uploadHeadeImage } = require('../router_handler/upload');

router.post('/headImage', uploadHeadeImage);

module.exports = router;