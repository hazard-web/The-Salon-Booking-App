// const { Sequelize } = require('sequelize');
// const dotenv = require('dotenv');

// dotenv.config();

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//   host: process.env.DB_HOST,
//   dialect: 'mysql',
// });

// sequelize.authenticate()
//   .then(() => {
//     console.log('Connection to MySQL has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

// module.exports = sequelize;

const { MongoClient } = require('mongodb');

let _db;
const MONGODB_URI = process.env.MONGODB_URI;

const Mongoconnect = async (callback) => {
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      // Critical TLS fixes for Atlas
      tls: true,
      autoSelectFamily: false,  // Fixes IPv6 resolution issues
      family: 4,                // Force IPv4 only
      
      // Connection timeouts
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
      // Atlas API version (required)
      serverApi: {
        version: '1',  // or ServerApiVersion.v1 if imported
        strict: true,
        deprecationErrors: true
      },
      
      // SSL rejectUnauthorized fix (Atlas default CA)
      rejectUnauthorized: true
    });

    console.log('✅ MongoDB Connection Established Successfully');
    _db = client.db();
    if (callback) callback(null);
    
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    if (callback) callback(err);
  }
};

const getdb = () => {
  if (_db) return _db;
  throw new Error('Database not initialized. Call Mongoconnect() first.');
};

module.exports = { Mongoconnect, getdb };
