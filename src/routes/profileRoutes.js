const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/discover', profileController.getAllProfiles);
router.get('/me', profileController.getMyProfile);
router.put('/me', profileController.updateProfile);

// Like routes
router.post('/like/:user_id', profileController.likeProfile);
router.delete('/like/:user_id', profileController.unlikeProfile);
router.get('/likes/received', profileController.getMyLikes);
router.get('/likes/given', profileController.getLikesGiven);

module.exports = router; 