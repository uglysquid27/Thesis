var express = require("express");
var router = express.Router();
var arimaController = require("../controllers/arima-controller")

router.get('/arimacalc', arimaController.index);

module.exports = router;