const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { userValidation, idParam } = require('../middleware/validation');

router.use(protect);

router.get('/technicians', userController.getTechnicians);

router
  .route('/')
  .get(authorize('admin', 'manager'), userController.getAllUsers)
  .post(authorize('admin'), userValidation.create, userController.createUser);

router
  .route('/:id')
  .get(idParam, userController.getUserById)
  .put(idParam, userValidation.update, authorize('admin'), userController.updateUser)
  .delete(idParam, authorize('admin'), userController.deleteUser);

module.exports = router;
