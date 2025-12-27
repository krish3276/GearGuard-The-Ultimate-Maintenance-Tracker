const workCenterService = require('../services/workCenterService');

const getAllWorkCenters = async (req, res, next) => {
  try {
    const workCenters = await workCenterService.getAllWorkCenters();
    res.status(200).json({
      success: true,
      count: workCenters.length,
      data: workCenters
    });
  } catch (error) {
    next(error);
  }
};

const getWorkCenterById = async (req, res, next) => {
  try {
    const workCenter = await workCenterService.getWorkCenterById(req.params.id);
    res.status(200).json({
      success: true,
      data: workCenter
    });
  } catch (error) {
    next(error);
  }
};

const createWorkCenter = async (req, res, next) => {
  try {
    const workCenter = await workCenterService.createWorkCenter(req.body);
    res.status(201).json({
      success: true,
      data: workCenter
    });
  } catch (error) {
    next(error);
  }
};

const updateWorkCenter = async (req, res, next) => {
  try {
    const workCenter = await workCenterService.updateWorkCenter(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: workCenter
    });
  } catch (error) {
    next(error);
  }
};

const deleteWorkCenter = async (req, res, next) => {
  try {
    const result = await workCenterService.deleteWorkCenter(req.params.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllWorkCenters,
  getWorkCenterById,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter
};
