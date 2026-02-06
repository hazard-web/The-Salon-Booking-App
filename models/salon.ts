const getdb = require('../config/db').getdb;

class Salon {
  name: string;
  address: string;
  phone: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
  approved: boolean; // Added approved property

  constructor(
    name: string,
    address: string,
    phone: string,
    ownerId: number,
    approved = false
  ) {
    if (!name || !address || !phone || !ownerId) {
      throw new Error('name, address, phone, and ownerId are required');
    }

    this.name = name;
    this.address = address;
    this.phone = phone;
    this.ownerId = ownerId;
    this.approved = approved;
    this.createdAt = new Date();
    this.updatedAt = new Date();
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

  static async findById(id: string) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    return await db.collection('Salon').findOne({ _id: new ObjectId(id) });
  }

  static async findByOwner(ownerId: number) {
    const db = getdb();
    return await db.collection('Salon').find({ ownerId }).toArray();
  }

  static async findAll() {
    const db = getdb();
    return await db.collection('Salon').find({}).toArray();
  }

  static async updateById(id: string, updateData: Partial<Salon>) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    return await db.collection('Salon').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }
}

export default Salon;
