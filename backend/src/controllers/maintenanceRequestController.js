const maintenanceRequestService = require('../services/maintenanceRequestService');

const getAllRequests = async (req, res, next) => {
  try {
    const requests = await maintenanceRequestService.getAllRequests();
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await maintenanceRequestService.getRequestById(req.params.id);
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const createRequest = async (req, res, next) => {
  try {
    const request = await maintenanceRequestService.createRequest(req.body, req.user);
    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const request = await maintenanceRequestService.updateRequest(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const result = await maintenanceRequestService.deleteRequest(req.params.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getRequestsByEquipment = async (req, res, next) => {
  try {
    const requests = await maintenanceRequestService.getRequestsByEquipment(req.params.equipmentId);
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

const getPreventiveByDateRange = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const requests = await maintenanceRequestService.getPreventiveByDateRange(start_date, end_date);
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const request = await maintenanceRequestService.updateStatus(req.params.id, req.body.status, req.user);
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const assignTechnician = async (req, res, next) => {
  try {
    const request = await maintenanceRequestService.assignTechnician(req.params.id, req.body.technician_id);
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  getRequestsByEquipment,
  getPreventiveByDateRange,
  updateStatus,
  assignTechnician
};
