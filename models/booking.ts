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
  serviceId: number;
  customerId: number;
  bookingDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(serviceId: number, customerId: number, bookingDate: Date | string, status = 'Pending') {
    if (!serviceId || !customerId || !bookingDate) {
      throw new Error('serviceId, customerId, and bookingDate are required');
    }

    this.serviceId = serviceId;
    this.customerId = customerId;
    this.bookingDate = new Date(bookingDate);
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    try {
      const db = getdb();
      const result = await db.collection('Booking').insertOne(this);
      console.log('✅ Booking saved:', result.insertedId);
      return result.insertedId;
    } catch (err) {
      console.error('❌ Booking save error:', err);
      throw err;
    }
  }

  static async findByCustomer(customerId: number) {
    const db = getdb();
    return await db.collection('Booking').find({ customerId }).toArray();
  }

  static async findByService(serviceId: number) {
    const db = getdb();
    return await db.collection('Booking').find({ serviceId }).toArray();
  }

  static async findUpcoming(customerId: number) {
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

  static async findByPk(id: number) {
    const db = getdb();
    return await db.collection('Booking').findOne({ id });
  }
}

export default Booking;
