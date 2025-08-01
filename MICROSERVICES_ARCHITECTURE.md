# Microservices Architecture for Movie List Application

## 🏗️ Architecture Overview

This project implements a modern microservices architecture that demonstrates enterprise-level system design skills highly valued by companies during campus placements.

### Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │  Load Balancer  │
│   (React)       │◄──►│   (Port 3000)   │◄──►│   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
              ┌─────▼───┐ ┌───▼────┐ ┌──▼──────┐
              │  Auth   │ │ Movie  │ │ Review  │
              │Service  │ │Service │ │ Service │
              │(3001)   │ │(3002)  │ │ (3003)  │
              └─────────┘ └────────┘ └─────────┘
                    │         │         │
                    └─────────┼─────────┘
                              │
              ┌───────────────▼────────────────┐
              │        Message Queue          │
              │         (RabbitMQ)            │
              └────────────────────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │         Databases             │
              │  ┌─────────┐ ┌──────────────┐  │
              │  │  Auth   │ │    Movie     │  │
              │  │MongoDB  │ │   MongoDB    │  │
              │  └─────────┘ └──────────────┘  │
              └────────────────────────────────┘
```

## 🎯 Key Benefits of This Architecture

### 1. **Scalability**
- Independent scaling of services based on demand
- Each service can be deployed on different servers
- Load balancing at service level

### 2. **Maintainability**
- Separation of concerns - each service has a specific responsibility
- Independent development and deployment
- Easier debugging and monitoring

### 3. **Technology Diversity**
- Each service can use different technologies if needed
- Database per service pattern
- Independent technology stack upgrades

### 4. **Fault Tolerance**
- If one service fails, others continue to work
- Circuit breaker patterns can be implemented
- Graceful degradation of functionality

### 5. **Team Organization**
- Different teams can own different services
- Independent release cycles
- Clear service boundaries

## 🚀 Services Architecture

### 1. **API Gateway** (Port 3000)
**Responsibility**: Single entry point for all client requests

**Features**:
- Request routing to appropriate services
- Authentication and authorization
- Rate limiting and security
- Request/response logging
- Service discovery and load balancing
- Cross-cutting concerns (CORS, security headers)

**Key Components**:
```javascript
// Service routing configuration
const SERVICES = {
  AUTH: 'http://localhost:3001',
  MOVIE: 'http://localhost:3002',
  REVIEW: 'http://localhost:3003',
  NOTIFICATION: 'http://localhost:3004'
};
```

### 2. **Authentication Service** (Port 3001)
**Responsibility**: User management and authentication

**Features**:
- User registration and login
- JWT token generation and validation
- Password reset and email verification
- Account security (lockout, rate limiting)
- OAuth integration (Google)
- User profile management

**Database**: `movielist-auth` (MongoDB)

**API Endpoints**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/validate-token` - Token validation (for other services)
- `GET /api/auth/user/:userId` - Get user details (for other services)

### 3. **Movie Service** (Port 3002)
**Responsibility**: Movie data management

**Features**:
- CRUD operations for movies
- Movie search and filtering
- Movie recommendations
- Movie analytics and insights
- Image/poster management
- Caching for performance

**Database**: `movielist-movies` (MongoDB)

**API Endpoints**:
- `GET /api/movies` - List movies with pagination and filters
- `POST /api/movies` - Create new movie (admin only)
- `GET /api/movies/:id` - Get movie details
- `PUT /api/movies/:id` - Update movie (admin only)
- `DELETE /api/movies/:id` - Delete movie (admin only)
- `GET /api/movies/search` - Search movies
- `GET /api/movies/recommendations` - Get movie recommendations

### 4. **Review Service** (Port 3003)
**Responsibility**: Movie reviews and ratings

**Features**:
- User reviews and ratings
- Review moderation
- Review analytics
- User review history
- Review voting (helpful/not helpful)

**Database**: `movielist-reviews` (MongoDB)

**API Endpoints**:
- `POST /api/reviews` - Create review
- `GET /api/reviews/movie/:movieId` - Get movie reviews
- `GET /api/reviews/user/:userId` - Get user reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### 5. **Notification Service** (Port 3004)
**Responsibility**: User notifications and communications

**Features**:
- Email notifications
- In-app notifications
- Push notifications
- Notification preferences
- Email templates
- Notification history

**Database**: `movielist-notifications` (MongoDB)

## 🔄 Inter-Service Communication

### 1. **Synchronous Communication (HTTP/REST)**
Used for real-time operations that require immediate response:

```javascript
// API Gateway calling Auth Service
const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/validate-token`, {
  token: userToken
});
```

### 2. **Asynchronous Communication (Message Queue)**
Used for event-driven operations that don't require immediate response:

```javascript
// Auth Service publishing user registration event
await messageQueue.publishUserRegistered({
  userId: user._id,
  username: user.username,
  email: user.email
});

// Notification Service consuming the event
messageQueue.consumeUserEvents((message) => {
  if (message.eventType === 'user.registered') {
    sendWelcomeEmail(message.data);
  }
});
```

### 3. **Message Queue Events**
- `user.registered` - New user registration
- `user.logged_in` - User login
- `password.reset_requested` - Password reset request
- `movie.created` - New movie added
- `review.created` - New review posted
- `notification.send` - Send notification

## 🗄️ Database Strategy

### Database per Service Pattern
Each service has its own database to ensure:
- Data isolation and security
- Independent scaling
- Technology flexibility
- Fault tolerance

### Database Configuration
```javascript
// Auth Service
MONGODB_URI=mongodb://localhost:27017/movielist-auth

// Movie Service  
MONGODB_URI=mongodb://localhost:27017/movielist-movies

// Review Service
MONGODB_URI=mongodb://localhost:27017/movielist-reviews

// Notification Service
MONGODB_URI=mongodb://localhost:27017/movielist-notifications
```

## 🚦 Service Discovery and Health Monitoring

### Health Check Implementation
Each service exposes a health endpoint:

```javascript
app.get('/health', (req, res) => {
  res.json({
    service: 'auth-service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0'
  });
});
```

### Service Status Monitoring
API Gateway monitors all services:

```javascript
app.get('/status', async (req, res) => {
  const serviceStatus = {};
  
  for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
    try {
      const response = await axios.get(`${serviceUrl}/health`);
      serviceStatus[serviceName] = { status: 'UP', ...response.data };
    } catch (error) {
      serviceStatus[serviceName] = { status: 'DOWN', error: error.message };
    }
  }
  
  res.json(serviceStatus);
});
```

## 🔐 Security Implementation

### 1. **Token-Based Authentication**
- JWT tokens issued by Auth Service
- API Gateway validates tokens before routing
- Service-to-service authentication

### 2. **Rate Limiting**
- Per-service rate limiting
- Different limits for different endpoints
- IP-based and user-based limiting

### 3. **Security Headers**
- CORS configuration
- Helmet.js for security headers
- Input validation and sanitization

## 📊 Monitoring and Logging

### Centralized Logging
```javascript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/service-name.log' }),
    new winston.transports.Console()
  ]
});
```

### Request Tracing
Each request gets a unique trace ID for tracking across services.

## 🛠️ Development and Deployment

### Local Development Setup
```bash
# Start all services
npm run dev:all

# Or start individually
npm run dev:gateway
npm run dev:auth
npm run dev:movie
npm run dev:review
npm run dev:notification
```

### Docker Deployment
```dockerfile
# Example Dockerfile for a service
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Configuration
```bash
# API Gateway
GATEWAY_PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
MOVIE_SERVICE_URL=http://localhost:3002

# Auth Service
AUTH_SERVICE_PORT=3001
AUTH_DB_URI=mongodb://localhost:27017/movielist-auth

# Movie Service
MOVIE_SERVICE_PORT=3002
MOVIE_DB_URI=mongodb://localhost:27017/movielist-movies
```

## 🎯 Why This Impresses Recruiters

### 1. **Enterprise Architecture Knowledge**
- Demonstrates understanding of scalable system design
- Shows knowledge of industry best practices
- Indicates ability to work on large-scale applications

### 2. **Modern Technology Stack**
- Microservices architecture
- Message queues for async communication
- API Gateway pattern
- Database per service pattern

### 3. **Scalability Considerations**
- Independent service scaling
- Caching strategies
- Load balancing concepts
- Performance optimization

### 4. **DevOps Awareness**
- Health monitoring
- Centralized logging
- Containerization ready
- CI/CD pipeline friendly

### 5. **Security Implementation**
- Token-based authentication
- Service-to-service security
- Rate limiting and protection
- Security best practices

### 6. **Professional Code Quality**
- Clean separation of concerns
- Comprehensive error handling
- Detailed logging and monitoring
- Well-documented APIs

## 🚀 Next Steps for Enhancement

1. **Service Mesh** (Istio/Linkerd)
2. **Container Orchestration** (Kubernetes)
3. **API Documentation** (Swagger/OpenAPI)
4. **Event Sourcing** for audit trails
5. **CQRS** for read/write separation
6. **Circuit Breaker** pattern implementation
7. **Distributed Tracing** (Jaeger/Zipkin)
8. **Metrics and Monitoring** (Prometheus/Grafana)

This microservices architecture demonstrates advanced backend development skills and system design knowledge that are highly valued by tech companies during campus recruitment.
