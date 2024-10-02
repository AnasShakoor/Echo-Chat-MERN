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
        required: true, 
    },
    read: { type: Boolean, default: false }
    ,

    timestamp: {
        type: Date,
        default: Date.now, 
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;