var express = require("express");
var router = express.Router();
// const moment = require("moment");
// const path = require("path");
// const multer = require("multer");
var monteCarloController = require("../controllers/monte-carlo-controller")

/* GET home page. */
router.get('/', monteCarloController.index);
// router.get('/testing', monteCarloController.montecarlotest);



module.exports = router;