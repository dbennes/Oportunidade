const express = require('express');

var app = express();

var authC  =require('../controllers/auth.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

var router = express.Router();

//user
router.post('/user/login', authC.userLogin);
router.post('/user/register', authC.userRegistration);

//admin
router.get('/admin/userList', requireAuth, requireAdmin, authC.userList)
router.put('/admin/changePass', requireAuth, authC.changePass)

// console.log(app);

module.exports = router;
