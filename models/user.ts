import { getdb } from '../config/db';
import { ObjectId, WithId } from 'mongodb';

export interface IUser {
  _id?: ObjectId; // MongoDB document ID
  username: string;
  email: string;
  password: string;
  mobileNumber: string;
  role: 'Customer' | 'Owner' | 'Admin';
}

const collectionName = 'users';

const User = {
  async create(user: IUser): Promise<ObjectId> {
    const db = getdb();
    const result = await db.collection<IUser>(collectionName).insertOne(user);
    return result.insertedId;
  },

  async findById(id: string): Promise<IUser | null> {
    const db = getdb();
    return await db.collection<IUser>(collectionName).findOne({ _id: new ObjectId(id) });
  },

  async findAll(): Promise<IUser[]> {
    const db = getdb();
    return await db.collection<IUser>(collectionName).find().toArray();
  },

  async updateById(id: string, update: Partial<IUser>): Promise<void> {
    const db = getdb();
    await db.collection<IUser>(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
  },

  async deleteById(id: string): Promise<void> {
    const db = getdb();
    await db.collection<IUser>(collectionName).deleteOne({ _id: new ObjectId(id) });
  },
};

export default User;

