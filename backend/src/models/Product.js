const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  compare_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  stock_qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  sku: { type: DataTypes.STRING(100), allowNull: true, unique: true },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  weight: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  category_id: { type: DataTypes.INTEGER, allowNull: true },
  vendor_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'products',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['slug'] },
    { fields: ['category_id'] },
    { fields: ['vendor_id'] },
    { fields: ['is_active', 'is_featured'] },
  ],
});

module.exports = Product;
