import { getdb } from '../config/db';

class Photo {
  url: string;
  description: string;
  uploadedBy: number;
  serviceId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(url: string, description: string, uploadedBy: number, serviceId: number) {
    this.url = url;
    this.description = description;
    this.uploadedBy = uploadedBy;
    this.serviceId = serviceId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
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

  static async findById(id: string) {
    const db = getdb();
    const { ObjectId } = require('mongodb');
    return await db.collection('Photo').findOne({ _id: new ObjectId(id) });
  }

  static async findByServiceId(serviceId: number) {
    const db = getdb();
    return await db.collection('Photo').find({ serviceId }).toArray();
  }

  static async findByUser(uploadedBy: number) {
    const db = getdb();
    return await db.collection('Photo').find({ uploadedBy }).toArray();
  }

  static async findAll() {
    const db = getdb();
    return await db.collection('Photo').find({}).toArray();
  }
}

export default Photo;
