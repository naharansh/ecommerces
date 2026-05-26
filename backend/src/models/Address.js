const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  label: { type: DataTypes.STRING(50), defaultValue: 'Home' },
  street: { type: DataTypes.STRING(255), allowNull: false },
  city: { type: DataTypes.STRING(100), allowNull: false },
  state: { type: DataTypes.STRING(100), allowNull: false },
  postal_code: { type: DataTypes.STRING(20), allowNull: false },
  country: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'US' },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_billing: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'addresses',
  underscored: true,
  timestamps: true,
});

module.exports = Address;
