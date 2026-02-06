// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/db');
// const User = require('./user');
// const Service = require('./service');

// const Photo = sequelize.define('Photo', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   url: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   description: {
//     type: DataTypes.STRING,
//   },
//   uploadedBy: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: User,
//       key: 'id',
//     },
//   },
//   serviceId: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: Service,
//       key: 'id',
//     },
//   },
//   createdAt: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW,
//   },
// }, {
//   timestamps: false,
// });

// module.exports = Photo;


const getdb = require('../config/db').getdb;

class Photo {
  constructor(url, description, uploadedBy, serviceId) {
    this.url = url;                    // ✅ Required (allowNull: false)
    this.description = description;    // ✅ Optional
    this.uploadedBy = uploadedBy;      // ✅ References User.id
    this.serviceId = serviceId;        // ✅ References Service.id
    this.createdAt = new Date();       // ✅ Matches Sequelize DATE default NOW
  }

  async save() {
    try {
      const db = getdb();
      const result = await db.collection('Photo').insertOne(this);
      console.log('✅ Photo saved to MongoDB:', result.insertedId);
      return result.insertedId;
    } catch (err) {
      console.error('❌ Photo save error:', err);
      throw err;
    }
  }

  // ✅ MongoDB Query Methods (replace Sequelize findAll/findByPk)
  static async findById(id) {
    const db = getdb();
    return await db.collection('Photo').findOne({ _id: id });
  }

  static async findByServiceId(serviceId) {
    const db = getdb();
    return await db.collection('Photo').find({ serviceId: serviceId }).toArray();
  }

  static async findByUser(uploadedBy) {
    const db = getdb();
    return await db.collection('Photo').find({ uploadedBy: uploadedBy }).toArray();
  }

  static async findAll() {
    const db = getdb();
    return await db.collection('Photo').find({}).toArray();
  }
}

module.exports = Photo;
