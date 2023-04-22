const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { uploadHeadeImage, uploadFile } = require('../router_handler/upload');

router.post('/headImage', uploadHeadeImage);

router.post("/uploadFile", multer({
  dest: path.join(__dirname, "../public/file")
}).single('file', 'fileName', 'userId'), uploadFile);

module.exports = router;