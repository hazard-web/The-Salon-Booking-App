const sequelize = require('../config/db');
const User = require('./user');

const initModels = async () => {
  await sequelize.sync({ alter: true });
  console.log('All models were synchronized successfully.');
};

initModels();

module.exports = {
    initModels,
    User,
};
