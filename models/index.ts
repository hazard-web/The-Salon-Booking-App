const User = require('./user');
const Service = require('./service');
const Booking = require('./booking');
const Salon = require('./salon');
const Billing = require('./billing');
const { getdb } = require('../config/db');

// ✅ MongoDB doesn't need relationships defined upfront
// Relationships handled via populate() queries when needed

// ✅ Simple init function (no sync needed for MongoDB)
export const initModels = async () => {
  try {
    const db = getdb();
    console.log('✅ MongoDB Models initialized successfully');
    console.log('📊 Collections ready: User, Service, Booking, Salon, Billing');

    // Optional: Create indexes for performance
    await db.collection('User').createIndex({ email: 1 }, { unique: true });
    await db.collection('User').createIndex({ username: 1 }, { unique: true });
    await db.collection('Service').createIndex({ salonId: 1 });
    await db.collection('Booking').createIndex({ customerId: 1 });
    await db.collection('Booking').createIndex({ serviceId: 1 });
    await db.collection('Billing').createIndex({ customerId: 1 });

    console.log('✅ Indexes created for optimal performance');
  } catch (error) {
    console.error('❌ Model initialization error:', error);
    throw error;
  }
};

// Added exports for Service and Booking models to make them accessible as modules.
export { default as Service } from './service';
export { default as Booking } from './booking';

// Added exports for Salon, User, and Billing models to ensure they are accessible in other modules.
export { default as Salon } from './salon';
export { default as User } from './user';
export { default as Billing } from './billing';

// IMPORTANT:
// Do NOT auto-init on require. `initModels()` needs an active DB connection.
