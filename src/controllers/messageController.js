const { User, Message, Notification } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize'); // Add this import
const { sendToUser } = require('../utils/socket');

// Send a message to another user
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content, message_type = 'text' } = req.body;
    const sender_id = req.user.id;
    
    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    // Check if user is trying to message themselves
    if (sender_id === parseInt(receiver_id)) {
      return res.status(400).json({ message: 'You cannot message yourself' });
    }
    
    // Create the message
    const message = await Message.create({
      sender_id,
      receiver_id: parseInt(receiver_id),
      content,
      message_type
    });
    
    // Get the full message with sender details
    const fullMessage = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'Sender',
        attributes: ['id', 'username', 'full_name', 'avatar']
      }]
    });
    
    // Create notification for receiver
    const notification = await Notification.create({
      user_id: parseInt(receiver_id),
      from_user_id: sender_id,
      type: 'message',
      title: 'New Message',
      message: `${req.user.username} sent you a message`,
      data: {
        message_id: message.id,
        sender_id,
        sender_username: req.user.username,
        sender_avatar: req.user.avatar
      }
    });
    
    // Send real-time message and notification if user is online
    sendToUser(parseInt(receiver_id), 'new_message', {
      message: fullMessage,
      sender: {
        id: req.user.id,
        username: req.user.username,
        full_name: req.user.full_name,
        avatar: req.user.avatar
      }
    });
    
    sendToUser(parseInt(receiver_id), 'new_notification', {
      id: notification.id,
      user_id: notification.user_id,
      from_user_id: notification.from_user_id,
      type: 'message',
      title: 'New Message',
      message: `${req.user.username} sent you a message`,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      is_read: notification.is_read,
      data: {
        message_id: message.id,
        sender_id,
        sender_username: req.user.username,
        sender_avatar: req.user.avatar
      }
    });
    
    res.json({ message: 'Message sent successfully', data: fullMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const { user_id } = req.params;
    const current_user_id = req.user.id;
    
    // Check if other user exists
    const otherUser = await User.findByPk(user_id);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get messages between the two users
    const messages = await Message.findAll({
      where: {
        [Op.or]: [ // Changed from sequelize.Op.or to Op.or
          { sender_id: current_user_id, receiver_id: parseInt(user_id) },
          { sender_id: parseInt(user_id), receiver_id: current_user_id }
        ]
      },
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'username', 'full_name', 'avatar']
        },
        {
          model: User,
          as: 'Receiver',
          attributes: ['id', 'username', 'full_name', 'avatar']
        }
      ],
      order: [['created_at', 'ASC']]
    });
    
    // Mark messages as read
    await Message.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          sender_id: parseInt(user_id),
          receiver_id: current_user_id,
          is_read: false
        }
      }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Error in getConversation:', error);
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
};

// Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const current_user_id = req.user.id;
    
    // Get all messages for the current user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [ // Changed from sequelize.Op.or to Op.or
          { sender_id: current_user_id },
          { receiver_id: current_user_id }
        ]
      },
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'username', 'full_name', 'avatar']
        },
        {
          model: User,
          as: 'Receiver',
          attributes: ['id', 'username', 'full_name', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Group messages by conversation (other user)
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const otherUserId = message.sender_id === current_user_id 
        ? message.receiver_id 
        : message.sender_id;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, message);
      }
    });
    
    const conversations = Array.from(conversationsMap.values());
    
    res.json(conversations);
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { user_id } = req.params;
    const current_user_id = req.user.id;
    
    await Message.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          sender_id: parseInt(user_id),
          receiver_id: current_user_id,
          is_read: false
        }
      }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const current_user_id = req.user.id;
    
    const message = await Message.findByPk(message_id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only sender can delete the message
    if (message.sender_id !== current_user_id) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }
    
    await message.destroy();
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage
};