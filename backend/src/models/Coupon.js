const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { DISCOUNT_TYPES } = require('../utils/constants');

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  discount_type: { type: DataTypes.ENUM(...Object.values(DISCOUNT_TYPES)), allowNull: false },
  discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  min_order_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  max_discount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  usage_limit: { type: DataTypes.INTEGER, allowNull: true },
  used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  starts_at: { type: DataTypes.DATE, allowNull: true },
  expires_at: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'coupons',
  underscored: true,
  timestamps: true,
});

module.exports = Coupon;
