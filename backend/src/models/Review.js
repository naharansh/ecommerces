const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  title: { type: DataTypes.STRING(255), allowNull: true },
  comment: { type: DataTypes.TEXT, allowNull: true },
  is_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'reviews',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['product_id'] },
    { fields: ['user_id'] },
    { unique: true, fields: ['user_id', 'product_id'] },
  ],
});

module.exports = Review;
