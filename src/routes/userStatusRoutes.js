const express = require('express');
const router = express.Router();
const { getOnlineUsers, getUserStatus, updateUserStatus, setUserOffline } = require('../controllers/userStatusController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all online users
router.get('/online', getOnlineUsers);

// Get specific user status
router.get('/:userId', getUserStatus);

// Update current user status
router.put('/status', updateUserStatus);

// Set current user offline
router.post('/offline', setUserOffline);

module.exports = router; 