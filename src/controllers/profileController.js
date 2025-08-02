const { User, Profile, Like, Notification } = require('../models');
const { sendToUser } = require('../utils/socket');
const { Op } = require('sequelize');

// Get all profiles (for discovery)
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      include: [{
        model: User,
        attributes: ['id', 'username', 'full_name', 'avatar']
      }],
      where: {
        is_public: true,
        user_id: {
          [Op.ne]: req.user.id // Exclude current user
        }
      }
    });
    
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profiles', error: error.message });
  }
};

// Get user's own profile
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'avatar']
      }]
    });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Create or update profile
const updateProfile = async (req, res) => {
  try {
    const { bio, avatar, location, interests, is_public } = req.body;
    
    let profile = await Profile.findOne({ where: { user_id: req.user.id } });
    
    if (profile) {
      await profile.update({
        bio,
        avatar,
        location,
        interests,
        is_public
      });
    } else {
      profile = await Profile.create({
        user_id: req.user.id,
        bio,
        avatar,
        location,
        interests,
        is_public
      });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Like a user's profile
const likeProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const liker_id = req.user.id;
    
    console.log('Like request:', { user_id, liker_id });
    
    // Check if user is trying to like themselves
    if (parseInt(user_id) === liker_id) {
      return res.status(400).json({ message: 'You cannot like your own profile' });
    }
    
    // Check if user exists
    const targetUser = await User.findByPk(user_id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already liked
    const existingLike = await Like.findOne({
      where: { liker_id, liked_user_id: user_id }
    });
    
    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this profile' });
    }
    
    // Check if there's already a recent notification for this like (within last 5 minutes)
    const recentNotification = await Notification.findOne({
      where: {
        user_id: parseInt(user_id),
        from_user_id: liker_id,
        type: 'like',
        created_at: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      }
    });
    
    if (recentNotification) {
      console.log('Recent notification already exists, skipping notification creation');
    }
    
    // Create the like
    const like = await Like.create({
      liker_id,
      liked_user_id: user_id
    });
    
    console.log('Like created:', like.toJSON());
    
    // Create notification for the liked user (only if no recent notification exists)
    if (!recentNotification) {
      const notification = await Notification.create({
        user_id: parseInt(user_id),
        from_user_id: liker_id,
        type: 'like',
        title: 'New Like',
        message: `${req.user.username} liked your profile!`,
        data: {
          liker_id,
          liker_username: req.user.username,
          liker_avatar: req.user.avatar
        }
      });
      
      console.log('Notification created:', notification.toJSON());
      
      // Send real-time notification if user is online
      sendToUser(parseInt(user_id), 'new_notification', {
        id: notification.id,
        user_id: notification.user_id,
        from_user_id: notification.from_user_id,
        type: 'like',
        title: 'New Like',
        message: `${req.user.username} liked your profile!`,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        is_read: notification.is_read,
        data: {
          liker_id,
          liker_username: req.user.username,
          liker_avatar: req.user.avatar
        }
      });
    }
    
    res.json({ message: 'Profile liked successfully', like });
  } catch (error) {
    console.error('Error in likeProfile:', error);
    res.status(500).json({ message: 'Error liking profile', error: error.message });
  }
};

// Unlike a user's profile
const unlikeProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const liker_id = req.user.id;
    
    console.log('Unlike request:', { user_id, liker_id });
    
    const like = await Like.findOne({
      where: { liker_id, liked_user_id: user_id }
    });
    
    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }
    
    // Remove the like
    await like.destroy();
    
    // Find and remove the corresponding notification
    console.log('Looking for notification with criteria:', {
      user_id: parseInt(user_id),
      from_user_id: liker_id,
      type: 'like'
    });
    
    const notification = await Notification.findOne({
      where: {
        user_id: parseInt(user_id),
        from_user_id: liker_id,
        type: 'like'
      },
      order: [['created_at', 'DESC']] // Get the most recent like notification
    });
    
    console.log('Found notification to remove:', notification ? notification.toJSON() : 'No notification found');
    
    if (notification) {
      console.log('Removing notification:', notification.toJSON());
      await notification.destroy();
      console.log('Notification destroyed successfully');
      
      // Send real-time notification removal if user is online
      const removalData = {
        type: 'like',
        notificationId: notification.id,
        from_user_id: liker_id,
        user_id: parseInt(user_id),
        // Include additional data for better matching
        notificationData: {
          id: notification.id,
          type: notification.type,
          from_user_id: notification.from_user_id,
          user_id: notification.user_id,
          created_at: notification.created_at
        }
      };
      console.log('Sending notification_removed event with data:', removalData);
      console.log('Target user ID for notification removal:', parseInt(user_id));
      
      // Send notification removal immediately
      sendToUser(parseInt(user_id), 'notification_removed', removalData);
      console.log('Notification removal event sent successfully');
    } else {
      console.log('No notification found to remove for like from user', liker_id, 'to user', user_id);
    }
    
    console.log('Like and notification removed successfully');
    res.json({ message: 'Profile unliked successfully' });
  } catch (error) {
    console.error('Error in unlikeProfile:', error);
    res.status(500).json({ message: 'Error unliking profile', error: error.message });
  }
};

// Get likes received by current user
const getMyLikes = async (req, res) => {
  try {
    const likes = await Like.findAll({
      where: { liked_user_id: req.user.id },
      include: [{
        model: User,
        as: 'Liker',
        attributes: ['id', 'username', 'full_name', 'avatar']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching likes', error: error.message });
  }
};

// Get likes given by current user
const getLikesGiven = async (req, res) => {
  try {
    console.log('Getting likes given for user:', req.user.id);
    
    const likes = await Like.findAll({
      where: { liker_id: req.user.id },
      include: [{
        model: User,
        as: 'LikedUser',
        attributes: ['id', 'username', 'full_name', 'avatar']
      }],
      order: [['created_at', 'DESC']]
    });
    
    console.log('Likes found:', likes.length);
    console.log('Likes data:', likes.map(like => ({ 
      id: like.id, 
      liker_id: like.liker_id, 
      liked_user_id: like.liked_user_id 
    })));
    
    res.json(likes);
  } catch (error) {
    console.error('Error in getLikesGiven:', error);
    res.status(500).json({ message: 'Error fetching likes', error: error.message });
  }
};

module.exports = {
  getAllProfiles,
  getMyProfile,
  updateProfile,
  likeProfile,
  unlikeProfile,
  getMyLikes,
  getLikesGiven
}; 