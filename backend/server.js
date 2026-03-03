const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const buildRoutes = require('./routes/builds');
const vinylRoutes = require('./routes/vinyls');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://world-frame-ladq.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/vinyls', vinylRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URL; // или process.env.MONGODB_URI, смотря как названо

if (!MONGO_URI) {
  console.error('❌ MONGO_URL не задан');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
