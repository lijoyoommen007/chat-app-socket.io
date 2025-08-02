const { User, UserStatus } = require('../models');
const { sendToUser, broadcast } = require('../utils/socket');

// Get online users
const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await UserStatus.findAll({
      where: { 
        is_online: true,
        user_id: {
          [require('sequelize').Op.ne]: req.user.id // Exclude current user
        }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'full_name', 'avatar']
        }
      ],
      attributes: ['status', 'last_seen', 'typing_to']
    });

    res.json(onlineUsers);
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ message: 'Error fetching online users', error: error.message });
  }
};

// Get user status
const getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userStatus = await UserStatus.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'full_name', 'avatar']
        }
      ]
    });

    if (!userStatus) {
      return res.status(404).json({ message: 'User status not found' });
    }

    res.json(userStatus);
  } catch (error) {
    console.error('Error fetching user status:', error);
    res.status(500).json({ message: 'Error fetching user status', error: error.message });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;

    const [userStatus, created] = await UserStatus.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        is_online: true,
        status: status || 'online',
        last_seen: new Date()
      }
    });

    if (!created) {
      await userStatus.update({
        status: status || userStatus.status,
        last_seen: new Date()
      });
    }

    // Broadcast status update to all users
    broadcast('user_status_update', {
      userId: userId,
      status: userStatus.status,
      isOnline: userStatus.is_online,
      lastSeen: userStatus.last_seen
    });

    res.json(userStatus);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// Set user offline
const setUserOffline = async (req, res) => {
  try {
    const userId = req.user.id;

    const userStatus = await UserStatus.findOne({
      where: { user_id: userId }
    });

    if (userStatus) {
      await userStatus.update({
        is_online: false,
        status: 'offline',
        last_seen: new Date(),
        typing_to: null
      });

      // Broadcast offline status
      broadcast('user_offline', { userId: userId });
    }

    res.json({ message: 'User set to offline' });
  } catch (error) {
    console.error('Error setting user offline:', error);
    res.status(500).json({ message: 'Error setting user offline', error: error.message });
  }
};

module.exports = {
  getOnlineUsers,
  getUserStatus,
  updateUserStatus,
  setUserOffline
}; 