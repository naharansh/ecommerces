const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  image_url: { type: DataTypes.STRING(500), allowNull: false },
  alt_text: { type: DataTypes.STRING(255), allowNull: true },
  is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'product_images',
  underscored: true,
  timestamps: true,
});

module.exports = ProductImage;
