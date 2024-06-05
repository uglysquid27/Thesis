var express = require("express");
var router = express.Router();
var monteCarloController = require("../controllers/monte-carlo-controller")

/* GET Monte Carlo Calculation. */
router.get('/montecarlocalc', monteCarloController.index);

module.exports = router;