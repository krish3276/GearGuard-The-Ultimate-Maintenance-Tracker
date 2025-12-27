const express = require('express');
const router = express.Router();
const workCenterController = require('../controllers/workCenterController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', workCenterController.getAllWorkCenters);
router.get('/:id', workCenterController.getWorkCenterById);
router.post('/', workCenterController.createWorkCenter);
router.put('/:id', workCenterController.updateWorkCenter);
router.delete('/:id', workCenterController.deleteWorkCenter);

module.exports = router;
