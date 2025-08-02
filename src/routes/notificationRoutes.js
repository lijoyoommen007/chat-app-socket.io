const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Notification routes
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read/:notification_id', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:notification_id', notificationController.deleteNotification);

module.exports = router; 