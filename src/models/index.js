const User = require('./User');
const Profile = require('./Profile');
const Like = require('./Like');
const Message = require('./Message');
const Notification = require('./Notification');
const UserStatus = require('./UserStatus');

// Define associations
User.hasOne(Profile, { foreignKey: 'user_id' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

// Like associations
User.hasMany(Like, { as: 'LikesGiven', foreignKey: 'liker_id' });
User.hasMany(Like, { as: 'LikesReceived', foreignKey: 'liked_user_id' });
Like.belongsTo(User, { as: 'Liker', foreignKey: 'liker_id' });
Like.belongsTo(User, { as: 'LikedUser', foreignKey: 'liked_user_id' });

// Message associations
User.hasMany(Message, { as: 'SentMessages', foreignKey: 'sender_id' });
User.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiver_id' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id' });

// Notification associations
User.hasMany(Notification, { as: 'Notifications', foreignKey: 'user_id' });
User.hasMany(Notification, { as: 'NotificationsSent', foreignKey: 'from_user_id' });
Notification.belongsTo(User, { as: 'User', foreignKey: 'user_id' });
Notification.belongsTo(User, { as: 'FromUser', foreignKey: 'from_user_id' });

// UserStatus associations
User.hasOne(UserStatus, { foreignKey: 'user_id' });
UserStatus.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  Profile,
  Like,
  Message,
  Notification,
  UserStatus
}; 