const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Регистрация
router.post('/register', [
    body('login').isLength({ min: 3 }).trim(),
    body('password').isLength({ min: 6 }),
    body('adminKey').optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { login, password, adminKey } = req.body;

        const existingUser = await User.findOne({ login });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь уже существует' });
        }

        const isAdmin = adminKey === process.env.ADMIN_KEY;

        const user = new User({
            login,
            password,
            isAdmin
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, login: user.login, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                login: user.login,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('❌ Register error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Вход
router.post('/login', [
    body('login').notEmpty(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { login, password } = req.body;

        const user = await User.findOne({ login });
        if (!user) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        const token = jwt.sign(
            { userId: user._id, login: user.login, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                login: user.login,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Проверка токена
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({
            user: {
                id: user._id,
                login: user.login,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(401).json({ message: 'Не авторизован' });
    }
});

module.exports = router;
