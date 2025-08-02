const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const validateUser = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', validateUser.register, userController.createUser);
router.post('/login', validateUser.login, userController.loginUser);

// Protected routes
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, validateUser.update, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router; 