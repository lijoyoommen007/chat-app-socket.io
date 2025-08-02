const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Message routes
router.post('/send', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/conversation/:user_id', messageController.getConversation);
router.put('/read/:user_id', messageController.markAsRead);
router.delete('/:message_id', messageController.deleteMessage);

module.exports = router; 