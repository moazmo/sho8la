const express = require('express');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user conversations
router.get('/user/:userId', async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: require('mongoose').Types.ObjectId(req.params.userId) },
            { receiverId: require('mongoose').Types.ObjectId(req.params.userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$read', false] }, { $eq: ['$receiverId', require('mongoose').Types.ObjectId(req.params.userId)] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { conversationId, receiverId, text } = req.body;

    if (!conversationId || !receiverId || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = new Message({
      conversationId,
      senderId: req.userId,
      receiverId,
      text
    });

    await message.save();
    await message.populate('senderId', 'name');
    res.status(201).json({ message: 'Message sent', message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ message: 'Marked as read', message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
