# Shared utilities and configurations for microservices

## Common Types and Interfaces

### User Types
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: 'customer' | 'admin';
  isGoogleUser: boolean;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark';
  };
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
```

### Movie Types
```typescript
interface Movie {
  id: string;
  title: string;
  genre: string[];
  year: number;
  director: string;
  cast: string[];
  plot: string;
  poster: string;
  trailer: string;
  rating: number;
  reviewCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Review Types
```typescript
interface Review {
  id: string;
  movieId: string;
  userId: string;
  rating: number;
  comment: string;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Common Response Formats

### Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: string[];
  code?: string;
}
```

## Event Types for Message Queue

### User Events
- `user.registered`
- `user.logged_in`
- `user.logged_out`
- `user.updated`
- `password.changed`
- `password.reset_requested`

### Movie Events
- `movie.created`
- `movie.updated`
- `movie.deleted`
- `movie.viewed`

### Review Events
- `review.created`
- `review.updated`
- `review.deleted`
- `review.voted`

### Notification Events
- `notification.send`
- `notification.email`
- `notification.push`

## Common Utility Functions

### Response Helpers
```javascript
const createSuccessResponse = (message, data, pagination = null) => ({
  success: true,
  message,
  data,
  ...(pagination && { pagination })
});

const createErrorResponse = (error, message, details = null) => ({
  success: false,
  error,
  message,
  ...(details && { details })
});
```

### Validation Helpers
```javascript
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password) && 
         /[!@#$%^&*(),.?":{}|<>]/.test(password);
};
```

### Database Connection Helper
```javascript
const connectDatabase = async (uri, serviceName) => {
  try {
    await mongoose.connect(uri);
    logger.info(`${serviceName}: MongoDB connected`);
  } catch (error) {
    logger.error(`${serviceName}: MongoDB connection failed:`, error);
    process.exit(1);
  }
};
```

## Environment Variables Template

Create `.env` file in each service directory:

```bash
# Common
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here
FRONTEND_URL=http://localhost:3000

# Database URLs
MONGODB_URI=mongodb://localhost:27017/movielist
AUTH_DB_URI=mongodb://localhost:27017/movielist-auth
MOVIE_DB_URI=mongodb://localhost:27017/movielist-movies
REVIEW_DB_URI=mongodb://localhost:27017/movielist-reviews
NOTIFICATION_DB_URI=mongodb://localhost:27017/movielist-notifications

# Service URLs
API_GATEWAY_URL=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:3001
MOVIE_SERVICE_URL=http://localhost:3002
REVIEW_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004

# Service Ports
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
MOVIE_SERVICE_PORT=3002
REVIEW_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004

# External Services
RABBITMQ_URL=amqp://localhost
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200

# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
PASSWORD_SALT_ROUNDS=12
SESSION_SECRET=your-session-secret
```

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AUTH_SERVICE_URL=http://auth-service:3001
      - MOVIE_SERVICE_URL=http://movie-service:3002
    depends_on:
      - auth-service
      - movie-service

  auth-service:
    build: ./auth-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/movielist-auth
    depends_on:
      - mongo
      - rabbitmq

  movie-service:
    build: ./movie-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/movielist-movies
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=password

volumes:
  mongo_data:
```

## Deployment Scripts

### Production Deployment
```bash
#!/bin/bash
# deploy.sh

echo "Deploying Movie List Microservices..."

# Build all services
docker-compose build

# Start services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Run health checks
curl -f http://localhost:3000/health || exit 1
curl -f http://localhost:3001/health || exit 1
curl -f http://localhost:3002/health || exit 1

echo "Deployment completed successfully!"
```

### Development Setup
```bash
#!/bin/bash
# setup-dev.sh

echo "Setting up development environment..."

# Install dependencies for all services
npm run install:all

# Start databases
docker-compose up -d mongo redis rabbitmq

# Wait for databases to be ready
sleep 10

# Start all services in development mode
npm run dev:all
```
