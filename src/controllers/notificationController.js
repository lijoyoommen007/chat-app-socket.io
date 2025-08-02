const { Notification, User } = require('../models');

// Get all notifications for current user
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const notifications = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      include: [{
        model: User,
        as: 'FromUser',
        attributes: ['id', 'username', 'full_name', 'avatar']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(notifications.count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notification_id } = req.params;
    
    const notification = await Notification.findByPk(notification_id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to current user
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only mark your own notifications as read' });
    }
    
    await notification.update({
      is_read: true,
      read_at: new Date()
    });
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          user_id: req.user.id,
          is_read: false
        }
      }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notification_id } = req.params;
    
    const notification = await Notification.findByPk(notification_id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to current user
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own notifications' });
    }
    
    await notification.destroy();
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    console.log('Getting unread count for user:', req.user.id);
    
    const count = await Notification.count({
      where: {
        user_id: req.user.id,
        is_read: false
      }
    });
    
    console.log('Unread count for user', req.user.id, ':', count);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
}; 