const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const buildRoutes = require('./routes/builds');
const vinylRoutes = require('./routes/vinyls');

const app = express();

// Разрешённые источники (CORS)
const allowedOrigins = [
  'http://localhost:3000',
  'https://world-frame-ladq.vercel.app',
  'https://world-frame-q4tr1f5rv-shellets-projects.vercel.app',
  'https://world-frame-kwlj5sxel-shellets-projects.vercel.app'
];
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Подключаем маршруты
app.use('/api/auth', authRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/vinyls', vinylRoutes);

const PORT = process.env.PORT || 5000;
// Используем переменную, которая уже есть на Render — MONGODB_URI
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI не задан в переменных окружения');
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



