const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const buildSchema = new mongoose.Schema({
    carName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Новые поля
    price: {
        type: Number,
        default: 0
    },
    engine: {
        type: String,
        default: ''
    },
    turbo: {
        type: String,
        default: ''
    },
    transmission: {
        type: String,
        default: ''
    },
    suspension: {
        type: String,
        default: ''
    },
    brakes: {
        type: String,
        default: ''
    },
    tires: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Build', buildSchema);