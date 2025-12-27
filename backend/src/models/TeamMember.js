const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeamMember = sequelize.define('TeamMember', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  team_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'maintenance_teams',
      key: 'id'
    }
  }
}, {
  tableName: 'team_members',
  timestamps: true
});

module.exports = TeamMember;
