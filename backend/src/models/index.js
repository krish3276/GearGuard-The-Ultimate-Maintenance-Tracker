const sequelize = require('../config/database');
const User = require('./User');
const MaintenanceTeam = require('./MaintenanceTeam');
const TeamMember = require('./TeamMember');
const Equipment = require('./Equipment');
const MaintenanceRequest = require('./MaintenanceRequest');
const EquipmentCategory = require('./EquipmentCategory');
const WorkCenter = require('./WorkCenter');

// Team <-> User Many-to-Many
User.belongsToMany(MaintenanceTeam, {
  through: TeamMember,
  foreignKey: 'user_id',
  otherKey: 'team_id',
  as: 'teams'
});

MaintenanceTeam.belongsToMany(User, {
  through: TeamMember,
  foreignKey: 'team_id',
  otherKey: 'user_id',
  as: 'members'
});

// Equipment -> MaintenanceTeam
Equipment.belongsTo(MaintenanceTeam, {
  foreignKey: 'maintenance_team_id',
  as: 'maintenanceTeam'
});

MaintenanceTeam.hasMany(Equipment, {
  foreignKey: 'maintenance_team_id',
  as: 'equipment'
});

// Equipment -> EquipmentCategory
Equipment.belongsTo(EquipmentCategory, {
  foreignKey: 'category_id',
  as: 'category'
});

EquipmentCategory.hasMany(Equipment, {
  foreignKey: 'category_id',
  as: 'equipment'
});

// Equipment -> User (employee)
Equipment.belongsTo(User, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// Equipment -> User (technician)
Equipment.belongsTo(User, {
  foreignKey: 'technician_id',
  as: 'technician'
});

// Equipment -> WorkCenter
Equipment.belongsTo(WorkCenter, {
  foreignKey: 'work_center_id',
  as: 'workCenter'
});

WorkCenter.hasMany(Equipment, {
  foreignKey: 'work_center_id',
  as: 'equipment'
});

// EquipmentCategory -> User (responsible)
EquipmentCategory.belongsTo(User, {
  foreignKey: 'responsible_user_id',
  as: 'responsible'
});

// MaintenanceRequest -> Equipment
MaintenanceRequest.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment'
});

Equipment.hasMany(MaintenanceRequest, {
  foreignKey: 'equipment_id',
  as: 'maintenanceRequests'
});

// MaintenanceRequest -> WorkCenter
MaintenanceRequest.belongsTo(WorkCenter, {
  foreignKey: 'work_center_id',
  as: 'workCenter'
});

WorkCenter.hasMany(MaintenanceRequest, {
  foreignKey: 'work_center_id',
  as: 'maintenanceRequests'
});

// MaintenanceRequest -> MaintenanceTeam
MaintenanceRequest.belongsTo(MaintenanceTeam, {
  foreignKey: 'maintenance_team_id',
  as: 'maintenanceTeam'
});

MaintenanceTeam.hasMany(MaintenanceRequest, {
  foreignKey: 'maintenance_team_id',
  as: 'maintenanceRequests'
});

// MaintenanceRequest -> User (technician)
MaintenanceRequest.belongsTo(User, {
  foreignKey: 'assigned_technician_id',
  as: 'assignedTechnician'
});

User.hasMany(MaintenanceRequest, {
  foreignKey: 'assigned_technician_id',
  as: 'assignedRequests'
});

module.exports = {
  sequelize,
  User,
  MaintenanceTeam,
  TeamMember,
  Equipment,
  MaintenanceRequest,
  EquipmentCategory,
  WorkCenter
};
