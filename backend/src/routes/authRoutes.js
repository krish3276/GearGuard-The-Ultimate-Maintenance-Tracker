const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

router.post('/register', userValidation.create, authController.register);
router.post('/login', userValidation.login, authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
