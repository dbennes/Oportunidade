const express = require('express');
var app = express();

var commonController = require('../controllers/common.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

var router = express.Router();

// States
router.route('/state')
.get(commonController.getStateList)
.post(requireAuth, requireAdmin, commonController.addState)

//Cities
router.route('/cities')
.get(commonController.getAllCities)
.post(requireAuth, requireAdmin, commonController.addCity)

router.get('/cities/:state_id', commonController.getCityList)

router.delete('/city/:cityId', requireAuth, requireAdmin, commonController.removeCity)

//checkemail-availability
router.get('/checkemail-availability/email/:email', commonController.checkemailAvailability)

module.exports = router;