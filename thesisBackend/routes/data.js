var express = require("express");
var router = express.Router();
// const moment = require("moment");
// const path = require("path");
// const multer = require("multer");
const fetchingdataController = require("../controllers/fetchingdata-controller");

/* GET home page. */
router.get('/', fetchingdataController.index);
// router.get('/testing', monteCarloController.montecarlotest);



module.exports = router;