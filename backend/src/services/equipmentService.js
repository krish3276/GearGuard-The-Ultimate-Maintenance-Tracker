const { Equipment, MaintenanceTeam, User, EquipmentCategory, WorkCenter } = require('../models');
const { NotFoundError, ConflictError } = require('../utils/errors');

const getAllEquipment = async () => {
  return Equipment.findAll({
    include: [
      { model: MaintenanceTeam, as: 'maintenanceTeam' },
      { model: EquipmentCategory, as: 'category' },
      { model: User, as: 'employee', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
      { model: WorkCenter, as: 'workCenter' }
    ]
  });
};

const getEquipmentById = async (id) => {
  const equipment = await Equipment.findByPk(id, {
    include: [
      { model: MaintenanceTeam, as: 'maintenanceTeam' },
      { model: EquipmentCategory, as: 'category' },
      { model: User, as: 'employee', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
      { model: WorkCenter, as: 'workCenter' }
    ]
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

  if (equipmentData.category_id) {
    const category = await EquipmentCategory.findByPk(equipmentData.category_id);
    if (!category) {
      throw new NotFoundError('Equipment category not found');
    }
  }

  if (equipmentData.employee_id) {
    const employee = await User.findByPk(equipmentData.employee_id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }
  }

  if (equipmentData.technician_id) {
    const technician = await User.findByPk(equipmentData.technician_id);
    if (!technician) {
      throw new NotFoundError('Technician not found');
    }
  }

  const equipment = await Equipment.create(equipmentData);
  return getEquipmentById(equipment.id);
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

  if (equipmentData.maintenance_team_id !== undefined && equipmentData.maintenance_team_id !== null) {
    const team = await MaintenanceTeam.findByPk(equipmentData.maintenance_team_id);
    if (!team) {
      throw new NotFoundError('Maintenance team not found');
    }
  }

  if (equipmentData.category_id !== undefined && equipmentData.category_id !== null) {
    const category = await EquipmentCategory.findByPk(equipmentData.category_id);
    if (!category) {
      throw new NotFoundError('Equipment category not found');
    }
  }

  if (equipmentData.employee_id !== undefined && equipmentData.employee_id !== null) {
    const employee = await User.findByPk(equipmentData.employee_id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }
  }

  if (equipmentData.technician_id !== undefined && equipmentData.technician_id !== null) {
    const technician = await User.findByPk(equipmentData.technician_id);
    if (!technician) {
      throw new NotFoundError('Technician not found');
    }
  }

  await equipment.update(equipmentData);
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
