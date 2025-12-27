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
  }
}, {
  tableName: 'maintenance_teams',
  timestamps: true
});

module.exports = MaintenanceTeam;
