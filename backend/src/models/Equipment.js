const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Equipment name is required' }
    }
  },
  serial_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Serial number is required' }
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'equipment_categories',
      key: 'id'
    }
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  warranty_end: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  assigned_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  scrap_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  work_center_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'work_centers',
      key: 'id'
    }
  },
  department_or_owner: {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_scrapped: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'equipment',
  timestamps: true
});

module.exports = Equipment;
