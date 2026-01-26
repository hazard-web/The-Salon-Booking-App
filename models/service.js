// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/db');
// const User = require('./user');

// const Service = sequelize.define('Service', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   description: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   price: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   duration: {
//     type: DataTypes.INTEGER, // Duration in minutes
//     allowNull: false,
//   },
//   createdBy: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: User,
//       key: 'id',
//     },
//   },
// }, {
//   timestamps: true,
//   onDelete: 'CASCADE', // Optionally add this if you want cascading behavior
//   onUpdate: 'CASCADE',
// });

// module.exports = Service;


const getdb = require('../config/db').getdb;

class Service {
  constructor(name, description, price, duration, createdBy) {
    // ✅ Validation
    if (!name || !description || !price || !duration || !createdBy) {
      throw new Error('name, description, price, duration, and createdBy are required');
    }

    if (typeof price !== 'number' || price <= 0) {
      throw new Error('price must be a positive number');
    }

    if (typeof duration !== 'number' || duration <= 0) {
      throw new Error('duration must be a positive number (in minutes)');
    }

    this.name = name;                    // ✅ STRING required
    this.description = description;      // ✅ STRING required
    this.price = parseFloat(price);      // ✅ FLOAT required
    this.duration = parseInt(duration);  // ✅ INTEGER (minutes) required
    this.createdBy = createdBy;          // ✅ References User.id
    this.createdAt = new Date();         // ✅ timestamps: true
    this.updatedAt = new Date();         // ✅ timestamps: true
  }

  async save() {
    try {
      const db = getdb();
      const result = await db.collection('Service').insertOne(this);
      console.log('✅ Service saved:', result.insertedId);
      return result.insertedId;
    } catch (err) {
      console.error('❌ Service save error:', err);
      throw err;
    }
  }

  // ✅ Query helpers
  static async findById(id) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    return await db.collection('Service').findOne({ _id: new ObjectId(id) });
  }

  static async findByCreator(createdBy) {
    const db = getdb();
    return await db.collection('Service').find({ createdBy }).toArray();
  }

  static async findAll() {
    const db = getdb();
    return await db.collection('Service').find({}).toArray();
  }

  static async findByPriceRange(minPrice, maxPrice) {
    const db = getdb();
    return await db.collection('Service')
      .find({ price: { $gte: minPrice, $lte: maxPrice } })
      .toArray();
  }

  static async updateById(id, updateData) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    return await db.collection('Service').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }

  static async deleteById(id) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    return await db.collection('Service').deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Service;
