const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

// ─── Validate required env vars ───────────────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'SESSION_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`❌  Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const CORS_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

// ─── Session ──────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    dbName: 'crpms',
    collectionName: 'sessions',
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅  MongoDB connected → CRPMS database'))
  .catch((err) => console.error('❌  MongoDB connection error:', err));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/cars',          require('./routes/cars'));
app.use('/api/services',      require('./routes/services'));
app.use('/api/servicerecords',require('./routes/serviceRecords'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/activity',      require('./routes/activity'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'CRPMS API is running 🚗' }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌  Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
