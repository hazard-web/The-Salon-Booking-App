const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Service = require('./service');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  serviceId: {
    type: DataTypes.INTEGER,
    references: {
      model: Service,
      key: 'id',
    },
  },
  customerId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled'),
    defaultValue: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = Booking;
