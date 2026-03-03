const express = require('express');
const router = express.Router();
const Vinyl = require('../models/Vinyl');
const { auth, adminAuth } = require('../middleware/auth');

// Получить все винилы
router.get('/', async (req, res) => {
    try {
        const vinyls = await Vinyl.find().populate('authorId', 'login').sort('-createdAt');
        res.json(vinyls);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получить винилы по машине
router.get('/car/:carName', async (req, res) => {
    try {
        const vinyls = await Vinyl.find({ car: req.params.carName }).populate('authorId', 'login').sort('-createdAt');
        res.json(vinyls);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Создать новый винил
router.post('/', auth, async (req, res) => {
    try {
        const { name, car, code, image } = req.body;
        
        const vinyl = new Vinyl({
            name,
            car,
            code,
            image,
            author: req.user.login,
            authorId: req.user.userId
        });

        await vinyl.save();
        res.status(201).json(vinyl);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Поставить лайк/дизлайк
router.post('/:id/like', auth, async (req, res) => {
    try {
        const { type } = req.body;
        const vinyl = await Vinyl.findById(req.params.id);
        
        if (!vinyl) {
            return res.status(404).json({ message: 'Винил не найден' });
        }

        if (type === 'like') {
            vinyl.dislikes = vinyl.dislikes.filter(id => id.toString() !== req.user.userId);
            if (!vinyl.likes.includes(req.user.userId)) {
                vinyl.likes.push(req.user.userId);
            } else {
                vinyl.likes = vinyl.likes.filter(id => id.toString() !== req.user.userId);
            }
        } else {
            vinyl.likes = vinyl.likes.filter(id => id.toString() !== req.user.userId);
            if (!vinyl.dislikes.includes(req.user.userId)) {
                vinyl.dislikes.push(req.user.userId);
            } else {
                vinyl.dislikes = vinyl.dislikes.filter(id => id.toString() !== req.user.userId);
            }
        }

        await vinyl.save();
        res.json({ 
            likes: vinyl.likes.length, 
            dislikes: vinyl.dislikes.length,
            userAction: vinyl.likes.includes(req.user.userId) ? 'like' : 
                       (vinyl.dislikes.includes(req.user.userId) ? 'dislike' : null)
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Добавить комментарий
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const vinyl = await Vinyl.findById(req.params.id);
        
        if (!vinyl) {
            return res.status(404).json({ message: 'Винил не найден' });
        }

        vinyl.comments.push({
            author: req.user.login,
            text
        });

        await vinyl.save();
        res.json(vinyl.comments[vinyl.comments.length - 1]);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Удалить винил (только админ)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await Vinyl.findByIdAndDelete(req.params.id);
        res.json({ message: 'Винил удалён' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Удалить комментарий (только админ)
router.delete('/:id/comment/:commentId', adminAuth, async (req, res) => {
    try {
        const vinyl = await Vinyl.findById(req.params.id);
        if (!vinyl) {
            return res.status(404).json({ message: 'Винил не найден' });
        }

        vinyl.comments = vinyl.comments.filter(c => c._id.toString() !== req.params.commentId);
        await vinyl.save();
        res.json({ message: 'Комментарий удалён' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;