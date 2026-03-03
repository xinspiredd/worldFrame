const express = require('express');
const router = express.Router();
const Build = require('../models/Build');
const { auth, adminAuth } = require('../middleware/auth');

// Получить все билды для конкретной машины
router.get('/:carName', async (req, res) => {
    try {
        const builds = await Build.find({ carName: req.params.carName })
            .populate('authorId', 'login')
            .sort('-createdAt');
        res.json(builds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Создать новый билд
router.post('/', auth, async (req, res) => {
    try {
        const { carName, title, details } = req.body;
        const build = new Build({
            carName,
            title,
            details,
            author: req.user.login,
            authorId: req.user.userId
        });
        await build.save();
        res.status(201).json(build);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Поставить лайк/дизлайк
router.post('/:id/like', auth, async (req, res) => {
    try {
        const { type } = req.body; // 'like' или 'dislike'
        const build = await Build.findById(req.params.id);
        if (!build) {
            return res.status(404).json({ message: 'Билд не найден' });
        }

        if (type === 'like') {
            build.dislikes = build.dislikes.filter(id => id.toString() !== req.user.userId);
            if (!build.likes.includes(req.user.userId)) {
                build.likes.push(req.user.userId);
            } else {
                build.likes = build.likes.filter(id => id.toString() !== req.user.userId);
            }
        } else {
            build.likes = build.likes.filter(id => id.toString() !== req.user.userId);
            if (!build.dislikes.includes(req.user.userId)) {
                build.dislikes.push(req.user.userId);
            } else {
                build.dislikes = build.dislikes.filter(id => id.toString() !== req.user.userId);
            }
        }

        await build.save();
        res.json({
            likes: build.likes.length,
            dislikes: build.dislikes.length,
            userAction: build.likes.includes(req.user.userId) ? 'like' :
                       (build.dislikes.includes(req.user.userId) ? 'dislike' : null)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Добавить комментарий
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const build = await Build.findById(req.params.id);
        if (!build) {
            return res.status(404).json({ message: 'Билд не найден' });
        }

        build.comments.push({
            author: req.user.login,
            text
        });

        await build.save();
        res.json(build.comments[build.comments.length - 1]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Удалить билд (только админ)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await Build.findByIdAndDelete(req.params.id);
        res.json({ message: 'Билд удалён' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Удалить комментарий (только админ)
router.delete('/:id/comment/:commentId', adminAuth, async (req, res) => {
    try {
        const build = await Build.findById(req.params.id);
        if (!build) {
            return res.status(404).json({ message: 'Билд не найден' });
        }

        build.comments = build.comments.filter(c => c._id.toString() !== req.params.commentId);
        await build.save();
        res.json({ message: 'Комментарий удалён' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
