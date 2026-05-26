const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../utils/constants');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM(...Object.values(ORDER_STATUS)), defaultValue: ORDER_STATUS.PENDING },
  total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tax_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  shipping_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  coupon_code: { type: DataTypes.STRING(50), allowNull: true },
  payment_status: { type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)), defaultValue: PAYMENT_STATUS.PENDING },
  shipping_address: { type: DataTypes.JSON, allowNull: true },
  billing_address: { type: DataTypes.JSON, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  tracking_number: { type: DataTypes.STRING(100), allowNull: true },
  shipped_at: { type: DataTypes.DATE, allowNull: true },
  delivered_at: { type: DataTypes.DATE, allowNull: true },
  cancelled_at: { type: DataTypes.DATE, allowNull: true },
  cancel_reason: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'orders',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['order_number'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Order;
