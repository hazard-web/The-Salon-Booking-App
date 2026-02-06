// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/db');
// const User = require('./user');

// const Salon = sequelize.define('Salon', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   address: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   phone: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   ownerId: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: User,
//       key: 'id',
//     },
//   },
// }, {
//   timestamps: true,
// });

// module.exports = Salon;



const getdb = require('../config/db').getdb;

class Salon {
  constructor(name, address, phone, ownerId) {
    // ✅ Validation
    if (!name || !address || !phone || !ownerId) {
      throw new Error('name, address, phone, and ownerId are required');
    }

    this.name = name;                    // ✅ STRING required
    this.address = address;              // ✅ STRING required
    this.phone = phone;                  // ✅ STRING required
    this.ownerId = ownerId;              // ✅ References User.id
    this.createdAt = new Date();         // ✅ timestamps: true
    this.updatedAt = new Date();         // ✅ timestamps: true
  }

  async save() {
    try {
      const db = getdb();
      const result = await db.collection('Salon').insertOne(this);
      console.log('✅ Salon saved:', result.insertedId);
      return result.insertedId;
    } catch (err) {
      console.error('❌ Salon save error:', err);
      throw err;
    }
  }

  // ✅ Query helpers
  static async findById(id) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    return await db.collection('Salon').findOne({ _id: new ObjectId(id) });
  }

  static async findByOwner(ownerId) {
    const db = getdb();
    return await db.collection('Salon').find({ ownerId }).toArray();
  }

  static async findAll() {
    const db = getdb();
    return await db.collection('Salon').find({}).toArray();
  }

  static async updateById(id, updateData) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    return await db.collection('Salon').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }
}

module.exports = Salon;
