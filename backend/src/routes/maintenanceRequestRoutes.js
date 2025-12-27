const express = require('express');
const router = express.Router();
const maintenanceRequestController = require('../controllers/maintenanceRequestController');
const { protect, authorize } = require('../middleware/auth');
const { maintenanceRequestValidation, idParam } = require('../middleware/validation');

router.use(protect);

router.get('/preventive/calendar', maintenanceRequestValidation.getByDate, maintenanceRequestController.getPreventiveByDateRange);
router.get('/equipment/:equipmentId', maintenanceRequestController.getRequestsByEquipment);

router
  .route('/')
  .get(maintenanceRequestController.getAllRequests)
  .post(maintenanceRequestValidation.create, maintenanceRequestController.createRequest);

router
  .route('/:id')
  .get(idParam, maintenanceRequestController.getRequestById)
  .put(idParam, maintenanceRequestValidation.update, maintenanceRequestController.updateRequest)
  .delete(idParam, authorize('admin', 'manager'), maintenanceRequestController.deleteRequest);

router.patch('/:id/status', idParam, maintenanceRequestValidation.updateStatus, maintenanceRequestController.updateStatus);
router.patch('/:id/assign', idParam, authorize('admin', 'manager'), maintenanceRequestValidation.assign, maintenanceRequestController.assignTechnician);

module.exports = router;
