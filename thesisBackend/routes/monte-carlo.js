var express = require("express");
var router = express.Router();
var monteCarloController = require("../controllers/monte-carlo-controller")

router.post('/montecarlocalc', (req, res) => {
    const { attributeName } = req.body;
    monteCarloController.index(req, res, attributeName);
});

module.exports = router; 