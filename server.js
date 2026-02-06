const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:4000'],  // ✅ Add both URLs
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['Authorization'],
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));  // ✅ ADD THIS!

// ✅ Import routers
const Mongoconnect = require('./config/db').Mongoconnect;
const { initModels } = require('./models');
const authRouter = require('./routes/auth');
const customerRouter = require('./routes/customer');
const ownerRouter = require('./routes/owner');
const adminRouter = require('./routes/admin');
const notificationRouter = require('./routes/notification');
const billingRouter = require('./routes/billing');
const photoRouter = require('./routes/photo');

// ✅ Mount routers (NO DUPLICATES)
app.use('/auth', authRouter);           // ✅ ONLY mount once
app.use('/customer', customerRouter);
app.use('/owner', ownerRouter);
app.use('/admin', adminRouter);
app.use('/notification', notificationRouter);
app.use('/billing', billingRouter);
app.use('/photo', photoRouter);

// ✅ Logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// ✅ Test route
app.get('/', (req, res) => {
  res.json({ message: '✅ Salon Booking API running!' });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 4000;

// ✅ Start server (boot even if DB is down)
app.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});

// Connect to MongoDB in the background and init models when ready
Mongoconnect((err) => {
  if (err) return; // logged inside Mongoconnect
  initModels().catch((initErr) =>
    console.error('❌ Failed to initialize models:', initErr)
  );
});
