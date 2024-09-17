const express = require('express');
const dotenv = require('dotenv');

const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const sequelize = require('./config/db');
const authRouter = require('./routes/auth');
const { initModels } = require('./models');

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public'));

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use('/', authRouter);
app.use('/auth', authRouter);

// app.use((req, res, next) => {
//   console.log(`Request URL: ${req.url}`);
//   next();
// });


const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initModels();
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to MySQL has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });