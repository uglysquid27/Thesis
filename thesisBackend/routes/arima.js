var express = require("express");
var router = express.Router();
// const moment = require("moment");
// const path = require("path");
// const multer = require("multer");
var arimaController = require("../controllers/arima-controller")

/* GET home page. */
router.get('/', arimaController.index);
router.get('/testing', arimaController.arimatest);
// router.get('/get/:id', arimaController.findById);
// router.post('/store', arimaController.store);


module.exports = router;