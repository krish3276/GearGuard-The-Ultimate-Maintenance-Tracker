const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const teamRoutes = require('./teamRoutes');
const equipmentRoutes = require('./equipmentRoutes');
const maintenanceRequestRoutes = require('./maintenanceRequestRoutes');
const categoryRoutes = require('./categoryRoutes');
const workCenterRoutes = require('./workCenterRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/requests', maintenanceRequestRoutes);
router.use('/categories', categoryRoutes);
router.use('/workcenters', workCenterRoutes);

module.exports = router;
