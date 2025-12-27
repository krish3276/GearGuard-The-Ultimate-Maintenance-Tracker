require('dotenv').config();
const { sequelize } = require('../src/models');

const syncDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    console.log('Syncing database schema...');
    await sequelize.sync({ force: process.argv.includes('--force') });
    console.log('Database synchronized successfully.');

    if (process.argv.includes('--force')) {
      console.log('WARNING: Database was reset. All existing data has been deleted.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Unable to sync database:', error);
    process.exit(1);
  }
};

syncDatabase();
