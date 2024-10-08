const express = require('express');
const dotenv = require('dotenv');

const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));


// const { authMiddleware, roleMiddleware } = require('./middleware/auth');
const sequelize = require('./config/db');
const authRouter = require('./routes/auth');
const customerRouter = require('./routes/customer');
const ownerRouter = require('./routes/owner');
const adminRouter = require('./routes/admin');
const notificationRouter = require('./routes/notification');
const billingRouter = require('./routes/billing');
const photoRouter = require('./routes/photo');
const { initModels } = require('./models');

const corsOptions = {
  origin: 'http://localhost:4000',  // Frontend origin
  credentials: true,  // If you are dealing with cookies or session-based authentication
  allowedHeaders: ['Authorization', 'Content-Type'],  // Allowing Authorization header
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow the necessary HTTP methods
  exposedHeaders: ['Authorization'],  // Exposing Authorization for the client if needed
};

app.options('*', cors(corsOptions)); 



app.use('/', authRouter);
app.use('/', ownerRouter);
app.use('/auth', authRouter);
app.use('/customer', customerRouter);
app.use('/owner',ownerRouter);
app.use('/admin', adminRouter);
app.use('/notification', notificationRouter);
app.use('/billing', billingRouter);
app.use('/photo', photoRouter);

app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});


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