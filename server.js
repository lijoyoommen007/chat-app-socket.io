const http = require('http');
const app = require('./src/app');
const { initializeSocket } = require('./src/utils/socket');
const { sequelize } = require('./src/config/database');

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);
 
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection 
    await sequelize.authenticate(); 
    console.log('Database connection established successfully.');
     
    // Sync database (in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        // Try to sync without force first
        await sequelize.sync({ alter: false });
        console.log('Database synced successfully.');
      } catch (syncError) {
        if (syncError.parent && syncError.parent.code === 'ER_TOO_MANY_KEYS') {
          console.log('Too many keys error detected. Recreating tables...');
          await sequelize.sync({ force: true });
          console.log('Database synced successfully (tables recreated).');
        } else {
          throw syncError;
        }
      }
    }
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO server initialized`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer(); 