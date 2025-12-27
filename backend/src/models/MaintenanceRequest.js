const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('Corrective', 'Preventive'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Corrective', 'Preventive']],
        msg: 'Type must be Corrective or Preventive'
      }
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Subject is required' }
    }
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  maintenance_team_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'maintenance_teams',
      key: 'id'
    }
  },
  assigned_technician_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  scheduled_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  duration_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Duration must be positive' }
    }
  },
  status: {
    type: DataTypes.ENUM('New', 'In Progress', 'Repaired', 'Scrap'),
    allowNull: false,
    defaultValue: 'New'
  }
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  validate: {
    preventiveRequiresScheduledDate() {
      if (this.type === 'Preventive' && !this.scheduled_date) {
        throw new Error('Scheduled date is required for Preventive maintenance requests');
      }
    }
  }
});

module.exports = MaintenanceRequest;
