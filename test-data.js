const { User, Profile, Like, Message, Notification } = require('./src/models');
const bcrypt = require('bcryptjs');

const createTestData = async () => {
  try {
    console.log('Creating test data...');
    
    // Create test users
    const users = await User.bulkCreate([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 12),
        full_name: 'John Doe',
        avatar: 'https://via.placeholder.com/150'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 12),
        full_name: 'Jane Smith',
        avatar: 'https://via.placeholder.com/150'
      },
      {
        username: 'mike_wilson',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 12),
        full_name: 'Mike Wilson',
        avatar: 'https://via.placeholder.com/150'
      },
      {
        username: 'sarah_jones',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 12),
        full_name: 'Sarah Jones',
        avatar: 'https://via.placeholder.com/150'
      }
    ]);
    
    console.log('Users created:', users.length);
    
    // Create profiles for users
    const profiles = await Profile.bulkCreate([
      {
        user_id: users[0].id,
        bio: 'Software developer who loves coding and coffee',
        location: 'New York, NY',
        interests: ['coding', 'coffee', 'travel'],
        is_public: true
      },
      {
        user_id: users[1].id,
        bio: 'Designer with a passion for creativity',
        location: 'Los Angeles, CA',
        interests: ['design', 'art', 'photography'],
        is_public: true
      },
      {
        user_id: users[2].id,
        bio: 'Entrepreneur building the next big thing',
        location: 'San Francisco, CA',
        interests: ['business', 'startups', 'technology'],
        is_public: true
      },
      {
        user_id: users[3].id,
        bio: 'Artist exploring the world through creativity',
        location: 'Chicago, IL',
        interests: ['art', 'music', 'travel'],
        is_public: true
      }
    ]);
    
    console.log('Profiles created:', profiles.length);
    
    // Create some likes
    const likes = await Like.bulkCreate([
      {
        liker_id: users[0].id,
        liked_user_id: users[1].id
      },
      {
        liker_id: users[1].id,
        liked_user_id: users[0].id
      },
      {
        liker_id: users[2].id,
        liked_user_id: users[0].id
      },
      {
        liker_id: users[3].id,
        liked_user_id: users[1].id
      }
    ]);
    
    console.log('Likes created:', likes.length);
    
    // Create some messages
    const messages = await Message.bulkCreate([
      {
        sender_id: users[0].id,
        receiver_id: users[1].id,
        content: 'Hey Jane! I really liked your profile.',
        message_type: 'text'
      },
      {
        sender_id: users[1].id,
        receiver_id: users[0].id,
        content: 'Thanks John! I liked yours too!',
        message_type: 'text'
      },
      {
        sender_id: users[2].id,
        receiver_id: users[0].id,
        content: 'Hi John, I saw your profile and thought we might have some common interests.',
        message_type: 'text'
      }
    ]);
    
    console.log('Messages created:', messages.length);
    
    // Create some notifications
    const notifications = await Notification.bulkCreate([
      {
        user_id: users[1].id,
        from_user_id: users[0].id,
        type: 'like',
        title: 'New Like',
        message: 'john_doe liked your profile!',
        data: {
          liker_id: users[0].id,
          liker_username: 'john_doe',
          liker_avatar: 'https://via.placeholder.com/150'
        }
      },
      {
        user_id: users[0].id,
        from_user_id: users[1].id,
        type: 'message',
        title: 'New Message',
        message: 'jane_smith sent you a message',
        data: {
          message_id: messages[1].id,
          sender_id: users[1].id,
          sender_username: 'jane_smith',
          sender_avatar: 'https://via.placeholder.com/150'
        }
      }
    ]);
    
    console.log('Notifications created:', notifications.length);
    
    console.log('\n✅ Test data created successfully!');
    console.log('\nTest Users:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Password: password123`);
    });
    
    console.log('\nYou can now test the API with these credentials!');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  }
};

// Run the script if called directly
if (require.main === module) {
  const { sequelize } = require('./src/config/database');
  
  sequelize.sync({ force: true })
    .then(() => {
      console.log('Database synced');
      return createTestData();
    })
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { createTestData }; 