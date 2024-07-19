var express = require("express");
var router = express.Router();
// const moment = require("moment");
// const path = require("path");
// const multer = require("multer");
const fetchingdataController = require("../controllers/fetchingdata-controller");

/* GET home page. */
router.post('/fetch', fetchingdataController.index);


module.exports = router;