const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobileNumber: {
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      len: [10, 15], 
      isNumeric: true, 
    },
  },
  role: {
    type: DataTypes.ENUM('Customer', 'Owner', 'Admin'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = User;
