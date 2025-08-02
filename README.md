# Backend API

A real-time chat application backend built with Express.js, Socket.IO, and MySQL.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Real-time Communication**: Socket.IO for real-time messaging
- **Database**: MySQL with Sequelize ORM
- **Security**: Helmet, CORS, input validation
- **Error Handling**: Comprehensive error handling middleware

## Project Structure

```
backend/
├── src/
│   ├── app.js                 # Main Express application
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── controllers/
│   │   └── userController.js  # User-related controllers
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT authentication
│   │   ├── errorHandler.js    # Error handling
│   │   └── validationMiddleware.js # Request validation
│   ├── models/
│   │   ├── User.js           # User model
│   │   └── index.js          # Model associations
│   ├── routes/
│   │   ├── userRoutes.js     # User routes
│   │   └── index.js          # Main routes
│   └── utils/
│       └── socket.js         # Socket.IO manager
├── server.js                 # Server entry point
├── package.json
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=socket_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Socket Configuration
SOCKET_PORT=5001
```

3. Set up MySQL database:
```sql
CREATE DATABASE socket_db;
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Users (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Socket.IO Events

### Client to Server
- `private_message` - Send private message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

### Server to Client
- `user_online` - User came online
- `user_offline` - User went offline
- `private_message` - Receive private message
- `typing_start` - Someone started typing
- `typing_stop` - Someone stopped typing

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Database Models

### User
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `full_name`
- `avatar`
- `is_active`
- `last_login`
- `created_at`
- `updated_at`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | socket_db |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | 24h |
| `CORS_ORIGIN` | CORS origin | http://localhost:3000 |

## Dependencies

### Production
- `express` - Web framework
- `socket.io` - Real-time communication
- `sequelize` - ORM
- `mysql2` - MySQL driver
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - CORS middleware
- `helmet` - Security middleware
- `morgan` - HTTP request logger
- `express-validator` - Input validation
- `dotenv` - Environment variables

### Development
- `nodemon` - Auto-restart on file changes 