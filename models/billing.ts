// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/db');
// const User = require('./user');

const getdb = require('../config/db').getdb;

class Billing {
  customerId: number;
  amount: number;
  paymentIntentId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(customerId: number, amount: number, paymentIntentId: string, status = 'completed') {
    if (!customerId || !amount || !paymentIntentId) {
      throw new Error('customerId, amount, and paymentIntentId are required');
    }

    this.customerId = customerId;
    this.amount = parseFloat(amount.toString());
    this.paymentIntentId = paymentIntentId;
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    try {
      const db = getdb();
      const result = await db.collection('Billing').insertOne(this);
      console.log('✅ Billing saved:', result.insertedId);
      return result.insertedId;
    } catch (err) {
      console.error('❌ Billing save error:', err);
      throw err;
    }
  }

  static async findByCustomer(customerId: number) {
    const db = getdb();
    return await db.collection('Billing').find({ customerId }).sort({ createdAt: -1 }).toArray();
  }

  static async findByPaymentId(paymentIntentId: string) {
    const db = getdb();
    return await db.collection('Billing').findOne({ paymentIntentId });
  }
}

export default Billing;
