import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import { Mongoconnect } from './config/db';
import { initModels } from './models/index';
import authRouter from './routes/auth';
import customerRouter from './routes/customer';
import ownerRouter from './routes/owner';
import adminRouter from './routes/admin';
import notificationRouter from './routes/notification';
import billingRouter from './routes/billing';
import photoRouter from './routes/photo';

// Explicitly specify the path to the .env file
dotenv.config({ path: './.env' });
const app = express();

// Log the MONGODB_URI to verify its value
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// ✅ Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['Authorization'],
};
app.options('/auth', cors(corsOptions));
app.options('/customer', cors(corsOptions));
app.options('/owner', cors(corsOptions));
app.options('/admin', cors(corsOptions));
app.options('/notification', cors(corsOptions));
app.options('/billing', cors(corsOptions));
app.options('/photo', cors(corsOptions));

// ✅ Mount routers
app.use('/auth', authRouter);
app.use('/customer', customerRouter);
app.use('/owner', ownerRouter);
app.use('/admin', adminRouter);
app.use('/notification', notificationRouter);
app.use('/billing', billingRouter);
app.use('/photo', photoRouter);

// ✅ Middleware for logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

// ✅ 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).send('Not Found');
});

// ✅ Database connection and server start
Mongoconnect((err: Error | null) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  initModels()
    .then(() => {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((initErr: Error) => {
      console.error('Model initialization failed:', initErr);
      process.exit(1);
    });
});
