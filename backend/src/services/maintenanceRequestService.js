const { Op } = require('sequelize');
const { MaintenanceRequest, Equipment, MaintenanceTeam, User, TeamMember } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const equipmentService = require('./equipmentService');

const getAllRequests = async () => {
  return MaintenanceRequest.findAll({
    include: [
      { model: Equipment, as: 'equipment' },
      { model: MaintenanceTeam, as: 'maintenanceTeam' },
      { model: User, as: 'assignedTechnician' }
    ],
    order: [['created_at', 'DESC']]
  });
};

const getRequestById = async (id) => {
  const request = await MaintenanceRequest.findByPk(id, {
    include: [
      { model: Equipment, as: 'equipment' },
      { model: MaintenanceTeam, as: 'maintenanceTeam' },
      { model: User, as: 'assignedTechnician' }
    ]
  });
  if (!request) {
    throw new NotFoundError('Maintenance request not found');
  }
  return request;
};

const createRequest = async (requestData) => {
  const equipment = await Equipment.findByPk(requestData.equipment_id);
  if (!equipment) {
    throw new NotFoundError('Equipment not found');
  }

  if (equipment.is_scrapped) {
    throw new BadRequestError('Cannot create request for scrapped equipment');
  }

  // Auto-assign maintenance team from equipment if not provided
  if (!requestData.maintenance_team_id && equipment.maintenance_team_id) {
    requestData.maintenance_team_id = equipment.maintenance_team_id;
  }
  
  // Ensure status is always New for new requests
  requestData.status = 'New';

  // Validate preventive maintenance requires scheduled date
  if (requestData.type === 'Preventive' && !requestData.scheduled_date) {
    throw new BadRequestError('Scheduled date is required for Preventive maintenance requests');
  }

  // Validate assigned technician belongs to maintenance team if both are set
  if (requestData.assigned_technician_id && requestData.maintenance_team_id) {
    const isMember = await TeamMember.findOne({
      where: {
        user_id: requestData.assigned_technician_id,
        team_id: requestData.maintenance_team_id
      }
    });
    
    if (!isMember) {
      throw new BadRequestError('Assigned technician must be a member of the maintenance team');
    }
  }

  const newRequest = await MaintenanceRequest.create(requestData);
  
  // Return full data with associations
  return getRequestById(newRequest.id);
};

const updateRequest = async (id, requestData) => {
  const request = await MaintenanceRequest.findByPk(id);
  if (!request) {
    throw new NotFoundError('Maintenance request not found');
  }

  // Determine final type - either from update or existing
  const finalType = requestData.type || request.type;
  const finalScheduledDate = requestData.scheduled_date !== undefined 
    ? requestData.scheduled_date 
    : request.scheduled_date;

  if (finalType === 'Preventive' && !finalScheduledDate) {
    throw new BadRequestError('Scheduled date is required for Preventive maintenance requests');
  }

  await request.update(requestData);
  return getRequestById(id);
};

const deleteRequest = async (id) => {
  const request = await MaintenanceRequest.findByPk(id);
  if (!request) {
    throw new NotFoundError('Maintenance request not found');
  }
  await request.destroy();
  return { message: 'Maintenance request deleted successfully' };
};

const getRequestsByEquipment = async (equipmentId) => {
  const equipment = await Equipment.findByPk(equipmentId);
  if (!equipment) {
    throw new NotFoundError('Equipment not found');
  }

  return MaintenanceRequest.findAll({
    where: { equipment_id: equipmentId },
    include: [
      { model: Equipment, as: 'equipment' },
      { model: MaintenanceTeam, as: 'maintenanceTeam' },
      { model: User, as: 'assignedTechnician' }
    ],
    order: [['created_at', 'DESC']]
  });
};

const getPreventiveByDateRange = async (startDate, endDate) => {
  const whereClause = { type: 'Preventive' };
  
  // Add date range filter only if both dates are provided
  if (startDate && endDate) {
    whereClause.scheduled_date = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    whereClause.scheduled_date = {
      [Op.gte]: startDate
    };
  } else if (endDate) {
    whereClause.scheduled_date = {
      [Op.lte]: endDate
    };
  }

  return MaintenanceRequest.findAll({
    where: whereClause,
    include: [
      { model: Equipment, as: 'equipment' },
      { model: MaintenanceTeam, as: 'maintenanceTeam' },
      { model: User, as: 'assignedTechnician' }
    ],
    order: [['scheduled_date', 'ASC']]
  });
};

const updateStatus = async (id, status) => {
  const request = await MaintenanceRequest.findByPk(id);
  if (!request) {
    throw new NotFoundError('Maintenance request not found');
  }

  // Define valid status transitions
  const validTransitions = {
    'New': ['In Progress', 'Repaired', 'Scrap'],
    'In Progress': ['Repaired', 'Scrap', 'New'],
    'Repaired': ['In Progress'],
    'Scrap': []
  };

  // Skip validation if status is the same
  if (request.status === status) {
    return getRequestById(id);
  }

  if (!validTransitions[request.status].includes(status)) {
    throw new BadRequestError(
      `Cannot transition from ${request.status} to ${status}. Valid transitions: ${validTransitions[request.status].join(', ') || 'none (terminal state)'}`
    );
  }

  await request.update({ status });

  // Mark equipment as scrapped when request is moved to Scrap
  if (status === 'Scrap') {
    await equipmentService.markAsScrapped(request.equipment_id);
  }

  return getRequestById(id);
};

const assignTechnician = async (requestId, technicianId) => {
  const request = await MaintenanceRequest.findByPk(requestId);
  if (!request) {
    throw new NotFoundError('Maintenance request not found');
  }

  // Allow unassigning technician by passing null
  if (!technicianId) {
    await request.update({ assigned_technician_id: null });
    return getRequestById(requestId);
  }

  const technician = await User.findByPk(technicianId);
  if (!technician) {
    throw new NotFoundError('Technician not found');
  }

  if (technician.role !== 'technician') {
    throw new BadRequestError('User is not a technician');
  }

  if (request.maintenance_team_id) {
    const isMember = await TeamMember.findOne({
      where: {
        user_id: technicianId,
        team_id: request.maintenance_team_id
      }
    });

    if (!isMember) {
      throw new BadRequestError('Technician must be a member of the assigned maintenance team');
    }
  }

  await request.update({ assigned_technician_id: technicianId });
  return getRequestById(requestId);
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
