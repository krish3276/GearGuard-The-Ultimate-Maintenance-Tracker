const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkCenter = sequelize.define('WorkCenter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Work center name is required' }
    }
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tag: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  alternative_workcenters: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cost_per_hour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  capacity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 100
  },
  time_efficiency: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  oee_target: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 85,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'work_centers',
  timestamps: true
});

module.exports = WorkCenter;
