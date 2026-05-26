const { Sequelize } = require('sequelize');
const { db } = require('./env');

const sequelize = new Sequelize(db.database, db.username, db.password, {
  host: db.host,
  port: db.port,
  dialect: 'mysql',
  logging: db.logging,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
