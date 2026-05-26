const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const { sequelize } = require('./models');

const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL database connected successfully.');

    await sequelize.sync({ alter: false });
    logger.info('Database models synchronized.');

    app.listen(config.port, () => {
      logger.info(`ShopWave API server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
