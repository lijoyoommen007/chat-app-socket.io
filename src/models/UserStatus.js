const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserStatus = sequelize.define('UserStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  is_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_seen: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'away', 'busy'),
    defaultValue: 'offline'
  },
  typing_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'user_statuses',
  timestamps: true
});

module.exports = UserStatus; 