const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  request_type: {
    type: DataTypes.ENUM('equipment', 'work_center'),
    allowNull: false,
    defaultValue: 'equipment'
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  work_center_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'work_centers',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
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
    type: DataTypes.DATE,
    allowNull: true
  },
  request_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  duration_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Duration must be positive' }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
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
    requiresEquipmentOrWorkCenter() {
      if (this.request_type === 'equipment' && !this.equipment_id) {
        throw new Error('Equipment is required for equipment type requests');
      }
      if (this.request_type === 'work_center' && !this.work_center_id) {
        throw new Error('Work center is required for work center type requests');
      }
    }
  }
});

module.exports = MaintenanceRequest;
