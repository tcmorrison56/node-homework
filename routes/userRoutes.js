const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/api/users/register', userController.register);
router.post('/api/users/logon', userController.logon);
router.post('/api/users/logoff', userController.logoff);

module.exports = router;