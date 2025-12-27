const sequelize = require('../config/database');
const User = require('./User');
const MaintenanceTeam = require('./MaintenanceTeam');
const TeamMember = require('./TeamMember');
const Equipment = require('./Equipment');
const MaintenanceRequest = require('./MaintenanceRequest');

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

Equipment.belongsTo(MaintenanceTeam, {
  foreignKey: 'maintenance_team_id',
  as: 'maintenanceTeam'
});

MaintenanceTeam.hasMany(Equipment, {
  foreignKey: 'maintenance_team_id',
  as: 'equipment'
});

MaintenanceRequest.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment'
});

Equipment.hasMany(MaintenanceRequest, {
  foreignKey: 'equipment_id',
  as: 'maintenanceRequests'
});

MaintenanceRequest.belongsTo(MaintenanceTeam, {
  foreignKey: 'maintenance_team_id',
  as: 'maintenanceTeam'
});

MaintenanceTeam.hasMany(MaintenanceRequest, {
  foreignKey: 'maintenance_team_id',
  as: 'maintenanceRequests'
});

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
  MaintenanceRequest
};
