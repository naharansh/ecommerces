const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vendor = sequelize.define('Vendor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  store_name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  logo_url: { type: DataTypes.STRING(500), allowNull: true },
  banner_url: { type: DataTypes.STRING(500), allowNull: true },
  commission_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 10.00 },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  contact_email: { type: DataTypes.STRING(255), allowNull: true },
  contact_phone: { type: DataTypes.STRING(20), allowNull: true },
  address: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'vendors',
  underscored: true,
  timestamps: true,
});

module.exports = Vendor;
