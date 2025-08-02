const { sequelize } = require('./src/config/database');

const resetDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    console.log('Dropping all tables...');
    await sequelize.drop();
    console.log('All tables dropped successfully.');
    
    console.log('Creating all tables...');
    await sequelize.sync({ force: true });
    console.log('All tables created successfully.');
    
    console.log('Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase(); 