const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipmentCategory = sequelize.define('EquipmentCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Category name is required' }
    }
  },
  responsible_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'equipment_categories',
  timestamps: true
});

module.exports = EquipmentCategory;
