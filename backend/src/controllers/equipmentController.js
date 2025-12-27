const equipmentService = require('../services/equipmentService');

const getAllEquipment = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getAllEquipment();
    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

const getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getEquipmentById(req.params.id);
    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const equipment = await equipmentService.createEquipment(req.body);
    res.status(201).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const equipment = await equipmentService.updateEquipment(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    const result = await equipmentService.deleteEquipment(req.params.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
