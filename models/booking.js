// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/db');
// const User = require('./user');
// const Service = require('./service');

const { error } = require('console');

// const Booking = sequelize.define('Booking', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   serviceId: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: Service,
//       key: 'id',
//     },
//   },
//   customerId: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: User,
//       key: 'id',
//     },
//   },
//   bookingDate: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   status: {
//     type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled'),
//     defaultValue: 'Pending',
//   },
// }, {
//   timestamps: true,
// });

const getdb = require('../config/db').getdb;
const Valid_Status = ['Pending', 'Confirmed', 'Cancelled'];

class Booking {
  constructor(serviceId, customerId, bookingDate, status = 'Pending') {  // ✅ Default value
    // ✅ Validation
    if (!serviceId || !customerId || !bookingDate) {
      throw new Error('serviceId, customerId, and bookingDate are required');
    }
    
    if(!Valid_Status.includes(status)){
      throw new Error(`Invalid status: ${status}. Must be one of: ${Valid_Status.join(', ')}`);
    }
    
    this.serviceId = serviceId;
    this.customerId = customerId;
    this.bookingDate = new Date(bookingDate);  // ✅ Ensure proper Date object
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {  // ✅ Make async
    try {
      const db = getdb();
      const result = await db.collection('Booking').insertOne(this);
      console.log('✅ Booking saved:', result.insertedId);
      return result.insertedId;  // ✅ Return ID
    } catch (err) {
      console.error('❌ Booking save error:', err);
      throw err;
    }
  }

  // ✅ Query methods
  static async findByCustomer(customerId) {
    const db = getdb();
    return await db.collection('Booking').find({ customerId }).toArray();
  }

  static async findByService(serviceId) {
    const db = getdb();
    return await db.collection('Booking').find({ serviceId }).toArray();
  }

  static async findUpcoming(customerId) {
    const db = getdb();
    return await db.collection('Booking')
      .find({ 
        customerId, 
        status: 'Confirmed',
        bookingDate: { $gte: new Date() }  // Future bookings
      })
      .sort({ bookingDate: 1 })
      .toArray();
  }
}

module.exports = Booking;
