const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const buildRoutes = require('./routes/builds');
const vinylRoutes = require('./routes/vinyls');

const app = express();

// Настройка CORS – добавьте ваш домен фронтенда
const allowedOrigins = [
  'http://localhost:3000',
  'https://worldframe-backend.onrender.com', // ваш домен на Vercel
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
// Используем переменную из .env (у вас MONGO_DB_URL)
const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error('❌ MONGO_DB_URL не задан в переменных окружения');
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
