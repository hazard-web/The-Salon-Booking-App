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


const mongodb = require('mongodb');
const { Client } = require('twilio/lib/base/BaseTwilio');
const MongoClient = mongodb.MongoClient;

let _db;

Mongoconnect = (callback) => {
  MongoClient.connect('mongodb+srv://maximilian:CR9KZnb8pRcyQ4Qu@cluster0.uioeyxz.mongodb.net/?appName=Cluster0'
    )
    .then( client => {
      console.log('Connection Established Successfully');
      _db = client.db();
      callback();

    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};


const getdb = () => {
  if(_db){
    return _db;
  }
  throw 'No error found!';
}

exports.Mongoconnect = Mongoconnect;
exports.getdb = getdb;
