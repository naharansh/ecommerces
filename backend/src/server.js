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

    const server = app.listen(config.port, () => {
      logger.info(`ShopWave API server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`Port ${config.port} is in use, retrying in 5 seconds...`);
        setTimeout(() => {
          server.close();
          app.listen(config.port, () => {
            logger.info(`ShopWave API server running on port ${config.port}`);
          });
        }, 5000);
      } else {
        logger.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
