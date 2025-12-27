const { WorkCenter } = require('../models');
const { NotFoundError } = require('../utils/errors');

const getAllWorkCenters = async () => {
  return WorkCenter.findAll({
    order: [['name', 'ASC']]
  });
};

const getWorkCenterById = async (id) => {
  const workCenter = await WorkCenter.findByPk(id);
  if (!workCenter) {
    throw new NotFoundError('Work center not found');
  }
  return workCenter;
};

const createWorkCenter = async (data) => {
  return WorkCenter.create(data);
};

const updateWorkCenter = async (id, data) => {
  const workCenter = await WorkCenter.findByPk(id);
  if (!workCenter) {
    throw new NotFoundError('Work center not found');
  }
  await workCenter.update(data);
  return getWorkCenterById(id);
};

const deleteWorkCenter = async (id) => {
  const workCenter = await WorkCenter.findByPk(id);
  if (!workCenter) {
    throw new NotFoundError('Work center not found');
  }
  await workCenter.destroy();
  return { message: 'Work center deleted successfully' };
};

module.exports = {
  getAllWorkCenters,
  getWorkCenterById,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter
};
