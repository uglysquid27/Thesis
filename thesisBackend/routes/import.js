const express = require('express');
const multer = require('multer');
const path = require('path');
const { importCSV, index } = require('./../controllers/import-controller'); 
const app = express();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/csv', upload.single('file'), importCSV);

module.exports = router;