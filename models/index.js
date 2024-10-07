const sequelize = require('../config/db');
const User = require('./user');
const Service = require('./service');
const Booking = require('./booking');
const Salon = require('./salon');
const Billing = require('./billing');

// Define relationships with aliases
User.hasMany(Salon, { foreignKey: 'ownerId' });
Salon.belongsTo(User, { foreignKey: 'ownerId' });

Salon.hasMany(Service, { foreignKey: 'salonId' });
Service.belongsTo(Salon, { foreignKey: 'salonId' });

Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

User.hasMany(Booking, { foreignKey: 'customerId', as: 'customer' }); 
Booking.belongsTo(User, { foreignKey: 'customerId', as: 'customer' }); 

User.hasMany(Billing, { foreignKey: 'customerId' });
Billing.belongsTo(User, { foreignKey: 'customerId' });

// Function to synchronize models with retry logic
const executeWithRetry = async (action, retries = 20) => {
  while (retries > 0) {
    try {
      return await action();
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.original.code === 'ER_LOCK_DEADLOCK') {
        console.warn('Deadlock detected, retrying...');
        retries -= 1;
        await new Promise(res => setTimeout(res, 1000)); // Wait 1 second before retrying
      } else {
        throw error; // Rethrow if not a deadlock error
      }
    }
  }
  throw new Error('Max retries reached for deadlock.');
};

const initModels = async () => {
  await executeWithRetry(async () => {
    await sequelize.sync({ alter: false }); 
    console.log('All models were synchronized successfully.');
  });
};

initModels();

module.exports = {
  initModels,
  User,
  Service,
  Booking,
  Salon,
  Billing,
};
