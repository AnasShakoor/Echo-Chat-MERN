const express = require("express");
const router = express.Router();
const getUser = require("../middleware/getUser")
const { check, validationResult } = require('express-validator');
const Message = require("../models/Message")


router.post('/', getUser, [
    check('sender', 'Sender id is required').not().isEmpty(),
    check('receiver', 'receiver id  is required').not().isEmpty(),
    check('roomId', 'Room Id  is required').not().isEmpty(),
    check('message', 'message  is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors.array());
    }

    try {
        const { sender, receiver, roomId, message } = req.body;
        const chat = await Message.create({
            sender,
            receiver,
            roomId,
            message,
            read: false
        })

        res.status(201).json({
            success: true,
            chat
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create message"
        });
    }

})


router.post('/history', getUser, [
    check('roomId', 'Room Id  is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors.array());
    }

    try {
        const { roomId } = req.body;
        const history = await Message.find({ roomId: roomId })

        res.status(201).json({
            success: true,
            history
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get messages"
        });
    }

})



router.post('/mark-read', getUser, [
    check('roomId', 'Room Id  is required').not().isEmpty(),
    check('receiver', 'receiver  is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors.array());
    }
    try {
        const { roomId, receiver } = req.body;

        // Ensure both values exist before continuing
        if (!roomId || !receiver) {
            return res.status(400).json({
                success: false,
                message: "roomId and receiver are required"
            });
        }

        // Use `findOneAndUpdate` and ensure correct query/update
        const message = await Message.updateMany(
            { roomId: roomId, receiver: receiver, read: false },  // Query to find unread message
            { $set: { read: true } },  // Update to set read to true
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "No message found or already updated"
            });
        }

        // If message is found and updated
        res.status(200).json({
            success: true,
            message: "The message has been updated successfully",
            data: message
        });
    } catch (error) {
        console.error(error);  // Log error for debugging
        res.status(500).json({
            success: false,
            message: "Failed to update the message"
        });
    }


})



router.post('/get-first-unread', getUser, [
    check('roomId', 'Room Id  is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors.array());
    }
    try {
        const { roomId } = req.body;
        const message = await Message.findOne(
            { roomId: roomId, read: false },
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "No unread message found or already updated"
            });
        }
        res.status(200).json({
            success: true,
            message: "The last unread message fetched successfully",
            data: message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update the message"
        });
    }


})


router.get('/unread-messages/:roomId', getUser, async (req, res) => {
    
    try {
       const roomId = req.params.roomId;

       const count = await Message.countDocuments({ roomId: roomId, read: false });

        if (!count) {
            return res.status(200).json({
                unreadCount: 0
            });
        }
        res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Failed to get un read messages"
        });
    }


})




module.exports = router;
