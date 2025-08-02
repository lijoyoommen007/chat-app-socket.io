const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { UserStatus } = require('../models');

// Global variables to store socket state
let io;
let connectedUsers = new Map();
let typingUsers = new Map(); // Track who is typing to whom

// Setup authentication middleware
const setupMiddleware = () => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
};

// Setup event handlers
const setupEventHandlers = () => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store connected user
    connectedUsers.set(socket.userId, socket.id);
    
    // Update user status in database
    updateUserOnlineStatus(socket.userId, true);
    
    // Emit user online status to all users
    io.emit('user_online', { userId: socket.userId });
    
    // Send current user the list of online users
    socket.emit('online_users', Array.from(connectedUsers.keys()));
    
    // Handle private messages
    socket.on('private_message', (data) => {
      const targetSocketId = connectedUsers.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('private_message', {
          from: socket.userId,
          message: data.message,
          timestamp: new Date()
        });
      }
    });
    
    // Handle typing events
    socket.on('typing_start', (data) => {
      const targetUserId = data.to;
      const targetSocketId = connectedUsers.get(targetUserId);
      
      if (targetSocketId) {
        // Store typing state
        typingUsers.set(socket.userId, targetUserId);
        
        // Update database
        updateUserTypingStatus(socket.userId, targetUserId);
        
        // Emit to target user
        io.to(targetSocketId).emit('typing_start', {
          from: socket.userId,
          to: targetUserId
        });
      }
    });
    
    socket.on('typing_stop', (data) => {
      const targetUserId = data.to;
      const targetSocketId = connectedUsers.get(targetUserId);
      
      if (targetSocketId) {
        // Remove typing state
        typingUsers.delete(socket.userId);
        
        // Update database
        updateUserTypingStatus(socket.userId, null);
        
        // Emit to target user
        io.to(targetSocketId).emit('typing_stop', {
          from: socket.userId,
          to: targetUserId
        });
      }
    });
    
    // Handle profile view events
    socket.on('profile_view', (data) => {
      const targetSocketId = connectedUsers.get(data.user_id);
      if (targetSocketId) {
        io.to(targetSocketId).emit('profile_viewed', {
          viewer_id: socket.userId,
          timestamp: new Date()
        });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Remove from typing users
      typingUsers.delete(socket.userId);
      
      // Update user status in database
      updateUserOnlineStatus(socket.userId, false);
      
      // Emit user offline status to all users
      io.emit('user_offline', { userId: socket.userId });
    });
  });
};

// Initialize socket manager
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["*"],
      credentials: false
    }
  });
  
  setupMiddleware();
  setupEventHandlers();
  
  console.log('Socket.IO initialized successfully');
};

// Function to send message to specific user
const sendToUser = (userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  console.log(`sendToUser: Attempting to send ${event} to user ${userId}, socketId: ${socketId}`);
  
  if (event === 'notification_removed') {
    console.log(`sendToUser: NOTIFICATION REMOVAL - User: ${userId}, Event: ${event}, Data:`, data);
  }
  
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`sendToUser: Successfully sent ${event} to user ${userId}`);
  } else {
    console.log(`sendToUser: User ${userId} is not connected, cannot send ${event}`);
  }
};

// Function to broadcast to all connected users
const broadcast = (event, data) => {
  io.emit(event, data);
};

// Function to get connected users count
const getConnectedUsersCount = () => {
  return connectedUsers.size;
};

// Function to get all connected user IDs
const getConnectedUserIds = () => {
  return Array.from(connectedUsers.keys());
};

// Helper function to update user online status in database
const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    const [userStatus, created] = await UserStatus.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        is_online: isOnline,
        status: isOnline ? 'online' : 'offline',
        last_seen: new Date()
      }
    });

    if (!created) {
      await userStatus.update({
        is_online: isOnline,
        status: isOnline ? 'online' : 'offline',
        last_seen: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating user online status:', error);
  }
};

// Helper function to update user typing status in database
const updateUserTypingStatus = async (userId, typingTo) => {
  try {
    const userStatus = await UserStatus.findOne({
      where: { user_id: userId }
    });

    if (userStatus) {
      await userStatus.update({
        typing_to: typingTo
      });
    }
  } catch (error) {
    console.error('Error updating user typing status:', error);
  }
};

// Function to get socket instance
const getSocketIO = () => {
  return io;
};

// Function to get typing users
const getTypingUsers = () => {
  return Array.from(typingUsers.entries());
};

module.exports = {
  initializeSocket,
  sendToUser,
  broadcast,
  getConnectedUsersCount,
  getConnectedUserIds,
  getSocketIO,
  getTypingUsers
}; 