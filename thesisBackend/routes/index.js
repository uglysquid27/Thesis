var express = require('express');
var router = express.Router();
var { test, checkDatabaseConnection } = require('../config/connection'); // Assuming the connection.js file is one level up

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    await checkDatabaseConnection(test); // Check database connection

    res.render('index', { title: 'Express', database_connected: true }); // Pass database_connected status to the view
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    res.render('index', { title: 'Express', database_connected: false }); // Pass database_connected status to the view
  }
});

module.exports = router;
