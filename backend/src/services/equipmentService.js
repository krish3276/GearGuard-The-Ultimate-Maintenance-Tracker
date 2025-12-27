const { Equipment, MaintenanceTeam } = require('../models');
const { NotFoundError, ConflictError } = require('../utils/errors');

const getAllEquipment = async () => {
  return Equipment.findAll({
    include: [{ model: MaintenanceTeam, as: 'maintenanceTeam' }]
  });
};

const getEquipmentById = async (id) => {
  const equipment = await Equipment.findByPk(id, {
    include: [{ model: MaintenanceTeam, as: 'maintenanceTeam' }]
  });
  if (!equipment) {
    throw new NotFoundError('Equipment not found');
  }
  return equipment;
};

const createEquipment = async (equipmentData) => {
  const existing = await Equipment.findOne({
    where: { serial_number: equipmentData.serial_number }
  });
  if (existing) {
    throw new ConflictError('Equipment with this serial number already exists');
  }

  if (equipmentData.maintenance_team_id) {
    const team = await MaintenanceTeam.findByPk(equipmentData.maintenance_team_id);
    if (!team) {
      throw new NotFoundError('Maintenance team not found');
    }
  }

  return Equipment.create(equipmentData);
};

const updateEquipment = async (id, equipmentData) => {
  const equipment = await Equipment.findByPk(id);
  if (!equipment) {
    throw new NotFoundError('Equipment not found');
  }

  if (equipmentData.serial_number && equipmentData.serial_number !== equipment.serial_number) {
    const existing = await Equipment.findOne({
      where: { serial_number: equipmentData.serial_number }
    });
    if (existing) {
      throw new ConflictError('Equipment with this serial number already exists');
    }
  }

  // Validate maintenance team if provided (allow null to unassign)
  if (equipmentData.maintenance_team_id !== undefined && equipmentData.maintenance_team_id !== null) {
    const team = await MaintenanceTeam.findByPk(equipmentData.maintenance_team_id);
    if (!team) {
      throw new NotFoundError('Maintenance team not found');
    }
  }

  await equipment.update(equipmentData);
  
  // Return updated equipment with associations
  return getEquipmentById(id);
};

const deleteEquipment = async (id) => {
  const equipment = await Equipment.findByPk(id);
  if (!equipment) {
    throw new NotFoundError('Equipment not found');
  }
  await equipment.destroy();
  return { message: 'Equipment deleted successfully' };
};

const markAsScrapped = async (id) => {
  const equipment = await Equipment.findByPk(id);
  if (!equipment) {
    throw new NotFoundError('Equipment not found');
  }
  await equipment.update({ is_scrapped: true });
  return equipment;
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  markAsScrapped
};
