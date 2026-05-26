const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { USER_ROLES } = require('../utils/constants');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM(...Object.values(USER_ROLES)), defaultValue: USER_ROLES.CUSTOMER },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  google_id: { type: DataTypes.STRING(255), allowNull: true },
  avatar_url: { type: DataTypes.STRING(500), allowNull: true },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  last_login: { type: DataTypes.DATE, allowNull: true },
  failed_login_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  locked_until: { type: DataTypes.DATE, allowNull: true },
  refresh_token: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
});

module.exports = User;
