const express = require('express');

var app = express();
var userController = require('../controllers/users.controller');
const { requireAuth, requireSelfOrAdmin } = require('../middleware/auth');

var router = express.Router();

router.get('/:userId', requireAuth, requireSelfOrAdmin('userId'), userController.getUserDetails);

module.exports = router;
