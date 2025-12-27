const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');
const { equipmentValidation, idParam } = require('../middleware/validation');

router.use(protect);

router
  .route('/')
  .get(equipmentController.getAllEquipment)
  .post(authorize('admin', 'manager'), equipmentValidation.create, equipmentController.createEquipment);

router
  .route('/:id')
  .get(idParam, equipmentController.getEquipmentById)
  .put(idParam, authorize('admin', 'manager'), equipmentValidation.update, equipmentController.updateEquipment)
  .delete(idParam, authorize('admin'), equipmentController.deleteEquipment);

module.exports = router;
