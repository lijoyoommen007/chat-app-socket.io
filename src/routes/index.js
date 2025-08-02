const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const profileRoutes = require('./profileRoutes');
const messageRoutes = require('./messageRoutes');
const notificationRoutes = require('./notificationRoutes');
const userStatusRoutes = require('./userStatusRoutes');

// API routes
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/user-status', userStatusRoutes);

module.exports = router; 