const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceTeam = sequelize.define('MaintenanceTeam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Team name is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#3b82f6'
  }
}, {
  tableName: 'maintenance_teams',
  timestamps: true
});

module.exports = MaintenanceTeam;
