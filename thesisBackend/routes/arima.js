var express = require("express");
var router = express.Router();
var arimaController = require("../controllers/arima-controller")

// router.get('/arimacalc', arimaController.index);
router.post('/arimacalc', (req, res) => {
    const { attributeName } = req.body;
    arimaController.index(req, res, attributeName);
});

module.exports = router;