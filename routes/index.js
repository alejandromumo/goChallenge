const express = require('express');
const utils = require('../utils/utils');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {cities: utils.currentCitiesArray, millisecondsToString: utils.millisecondsToString,
                       temperatureToString: utils.temperatureToString, city: null, unitSystem: utils.unitSystem});
});

module.exports = router;
