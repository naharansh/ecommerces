const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  product_name: { type: DataTypes.STRING(255), allowNull: false },
  product_sku: { type: DataTypes.STRING(100), allowNull: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image_url: { type: DataTypes.STRING(500), allowNull: true },
}, {
  tableName: 'order_items',
  underscored: true,
  timestamps: true,
});

module.exports = OrderItem;
