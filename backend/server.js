const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const buildRoutes = require('./routes/builds');
const vinylRoutes = require('./routes/vinyls');

const app = express();

// CORS - разрешаем запросы с фронтенда
app.use(cors({
  origin: ['http://localhost:3000', 'world-frame-1adq-git-main-shelests-projects.vercel.app'], // добавьте свой домен с протоколом
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/vinyls', vinylRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGOBD_URL; // поддержка обоих вариантов, но лучше привести к единому виду

mongoose.connect(MONGODB_URI, {
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
});
