const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { PAYMENT_STATUS, PAYMENT_GATEWAYS } = require('../utils/constants');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  gateway: { type: DataTypes.ENUM(...Object.values(PAYMENT_GATEWAYS)), allowNull: false },
  transaction_id: { type: DataTypes.STRING(255), allowNull: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: 'USD' },
  status: { type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)), defaultValue: PAYMENT_STATUS.PENDING },
  gateway_response: { type: DataTypes.JSON, allowNull: true },
  paid_at: { type: DataTypes.DATE, allowNull: true },
  refunded_at: { type: DataTypes.DATE, allowNull: true },
  refund_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
}, {
  tableName: 'payments',
  underscored: true,
  timestamps: true,
});

module.exports = Payment;
