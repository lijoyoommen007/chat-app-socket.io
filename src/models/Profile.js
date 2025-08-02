const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  interests: {
    type: DataTypes.TEXT, // Use TEXT instead of JSON
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('interests');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('interests', JSON.stringify(value));
    }
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // Sequelize maps BOOLEAN -> TINYINT(1) DEFAULT 1
  }
}, {
  tableName: 'profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Profile;
