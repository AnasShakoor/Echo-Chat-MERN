const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: false,
    },
    read: { type: Boolean, default: false }
    ,

    timestamp: {
        type: Date,
        default: Date.now,
    },
    fileUrl: {
        type: String,
        required: false,
    },
    fileType: {
        type: String,
        required: false,
    },
    fileName: {
        type: String,
        required: false,
    },
    fileSize: {
        type: Number,
        required: false,
    },
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;