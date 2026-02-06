// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/db');
// const User = require('./user');

const getdb = require('../config/db').getdb;

class Billing {
  constructor(customerId, amount, paymentIntentId, status = 'completed') {  // ✅ Added status + default
    // ✅ Validation
    if (!customerId || !amount || !paymentIntentId) {
      throw new Error('customerId, amount, and paymentIntentId are required');
    }
    
    this.customerId = customerId;           // ✅ References User.id
    this.amount = parseFloat(amount);       // ✅ Ensure number
    this.paymentIntentId = paymentIntentId;
    this.status = status;                   // ✅ Required field (matches Sequelize)
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {  // ✅ Async/await
    try {
      const db = getdb();
      const result = await db.collection('Billing').insertOne(this);
      console.log('✅ Billing saved:', result.insertedId);
      return result.insertedId;  // ✅ Return ID for chaining
    } catch (err) {
      console.error('❌ Billing save error:', err);
      throw err;
    }
  }

  // ✅ Query helpers
  static async findByCustomer(customerId) {
    const db = getdb();
    return await db.collection('Billing').find({ customerId }).sort({ createdAt: -1 }).toArray();
  }

  static async findByPaymentId(paymentIntentId) {
    const db = getdb();
    return await db.collection('Billing').findOne({ paymentIntentId });
  }
}


// const Billing = sequelize.define('Billing', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   customerId: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: User,
//       key: 'id',
//     },
//     onDelete: 'CASCADE', 
//     onUpdate: 'CASCADE',
//   },
//   amount: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   paymentIntentId: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   status: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   createdAt: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW,
//   },
// }, {
//   timestamps: false,
// });

module.exports = Billing;
