// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const User = sequelize.define('User', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   username: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   mobileNumber: {
//     type: DataTypes.STRING, 
//     allowNull: false,
//     validate: {
//       len: [10, 15], 
//       isNumeric: true, 
//     },
//   },
//   role: {
//     type: DataTypes.ENUM('Customer', 'Owner', 'Admin'),
//     allowNull: false,
//   },
// }, {
//   timestamps: true,
// });

const getdb = require('../config/db').getdb;
const Valid_Roles = ['Customer', 'Owner', 'Admin'];

class User {
  constructor(username, email, password, mobilenumber, role) {
    // ✅ Validation
    if (!username || !email || !password || !mobilenumber || !role) {
      throw new Error('All fields are required');
    }

    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (!mobilenumber || mobilenumber.length < 10 || mobilenumber.length > 15) {
      throw new Error('Mobile number must be 10-15 digits');
    }
    if (!/^\d+$/.test(mobilenumber)) {
      throw new Error('Mobile number must contain only digits');
    }

    if (!Valid_Roles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${Valid_Roles.join(', ')}`);
    }

    this.username = username;
    this.email = email;
    this.password = password;
    this.mobilenumber = mobilenumber;
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    try {
      const db = getdb();
      
      // ✅ Check for unique constraints
      const existingUser = await db.collection('User').findOne({
        $or: [
          { username: this.username },
          { email: this.email }
        ]
      });

      if (existingUser) {
        throw new Error('Username or email already exists');
      }

      const result = await db.collection('User').insertOne(this);
      console.log('✅ User saved:', result.insertedId);
      return result.insertedId;
    } catch (err) {
      console.error('❌ User save error:', err);
      throw err;
    }
  }

  // ✅ ADD THESE STATIC METHODS (for auth controller)
  static async findOne(query) {
    const db = getdb();
    return await db.collection('User').findOne(query);
  }

  static async findByUsername(username) {
    const db = getdb();
    return await db.collection('User').findOne({ username });
  }

  static async findByEmail(email) {
    const db = getdb();
    return await db.collection('User').findOne({ email });
  }

  static async findByRole(role) {
    const db = getdb();
    return await db.collection('User').find({ role }).toArray();
  }

  static async findById(id) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    try {
      return await db.collection('User').findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return null; // Invalid ObjectId
    }
  }

  static async updateById(id, updateData) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    return await db.collection('User').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }
}

module.exports = User;

