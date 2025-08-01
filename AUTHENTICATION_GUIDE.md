# Advanced Authentication & Security System

## Overview
This project implements enterprise-grade authentication and security features suitable for production applications and impressive for company interviews.

## 🔐 Security Features Implemented

### 1. Enhanced User Model
- **Account Lockout**: Prevents brute force attacks by locking accounts after 5 failed attempts
- **Refresh Tokens**: Secure token rotation with automatic cleanup
- **Password Security**: Strong password requirements and secure hashing (bcrypt with 12 rounds)
- **Session Management**: Track user sessions, IP addresses, and user agents
- **Two-Factor Authentication Ready**: Schema prepared for 2FA implementation

### 2. Advanced Authentication Service
- **JWT Token Management**: Separate access and refresh tokens
- **Password Validation**: Enforces strong password policies
- **Secure Token Generation**: Cryptographically secure random token generation
- **Account Lock Detection**: Smart lockout detection and management
- **Client Information Tracking**: IP and User-Agent logging

### 3. Comprehensive Middleware
- **Rate Limiting**: Prevents abuse with configurable limits
- **Request Validation**: Schema-based input validation
- **Security Headers**: OWASP-recommended security headers
- **Request Logging**: Detailed request/response logging
- **Authentication Guards**: Multiple levels of authentication middleware

### 4. Security Configuration
- Centralized security settings
- Configurable rate limits
- Password policy enforcement
- Token expiry management

## 🚀 API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new user with enhanced security.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "username": "johndoe", "email": "john@example.com" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  }
}
```

#### POST `/api/auth/login`
Secure login with account lockout protection.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "username": "johndoe" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  }
}
```

#### POST `/api/auth/refresh`
Refresh expired access tokens.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/api/auth/logout`
Logout from current device.

**Headers:** `Authorization: Bearer <accessToken>`
**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/api/auth/logout-all`
Logout from all devices (security feature).

**Headers:** `Authorization: Bearer <accessToken>`

### Profile Management

#### GET `/api/auth/profile`
Get current user profile.

**Headers:** `Authorization: Bearer <accessToken>`

#### PUT `/api/auth/profile`
Update user profile.

**Headers:** `Authorization: Bearer <accessToken>`
**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

#### PUT `/api/auth/change-password`
Change user password with validation.

**Headers:** `Authorization: Bearer <accessToken>`
**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

### Password Recovery

#### POST `/api/auth/forgot-password`
Request password reset token.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password using token.

**Request Body:**
```json
{
  "token": "secure-reset-token",
  "newPassword": "NewSecurePass123!"
}
```

### Security Information

#### GET `/api/auth/security-info`
Get account security information.

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "data": {
    "lastLogin": "2024-01-15T10:30:00Z",
    "loginAttempts": 0,
    "isLocked": false,
    "isEmailVerified": true,
    "isTwoFactorEnabled": false,
    "activeTokens": 2,
    "registeredAt": "2024-01-01T12:00:00Z"
  }
}
```

## 🛡️ Security Features Detail

### Password Policy
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting
- **Login**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per 15 minutes
- **Password Reset**: 3 attempts per hour
- **General API**: 100 requests per 15 minutes

### Account Lockout
- Lock after 5 failed login attempts
- Lock duration: 2 hours
- Automatic unlock after expiry
- Manual unlock available

### Token Security
- **Access Token**: 15-minute expiry
- **Refresh Token**: 7-day expiry
- **Reset Token**: 10-minute expiry
- Automatic token cleanup
- Maximum 5 active refresh tokens per user

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'`

## 🏗️ Architecture Benefits

### 1. **Separation of Concerns**
- **Models**: Data structure and business logic
- **Services**: Reusable business logic
- **Controllers**: Request handling and response formatting
- **Middleware**: Cross-cutting concerns (auth, validation, logging)
- **Routes**: API endpoint definitions

### 2. **Security-First Design**
- Input validation at multiple levels
- Rate limiting to prevent abuse
- Secure password hashing and storage
- Token-based authentication with refresh mechanism
- Account lockout protection

### 3. **Scalability**
- Stateless JWT authentication
- Configurable security parameters
- Middleware-based architecture
- Service-oriented design

### 4. **Maintainability**
- Centralized configuration
- Comprehensive error handling
- Detailed logging
- Clear separation of concerns

## 🧪 Testing Recommendations

### Unit Tests
```javascript
// Example test structure
describe('AuthService', () => {
  describe('validatePassword', () => {
    it('should reject weak passwords', () => {
      const result = authService.validatePassword('weak');
      expect(result.isValid).toBe(false);
    });
  });
});
```

### Integration Tests
```javascript
describe('POST /api/auth/login', () => {
  it('should lock account after 5 failed attempts', async () => {
    // Test account lockout functionality
  });
});
```

## 🚀 Production Deployment

### Environment Variables
```bash
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/moviedb
FRONTEND_URL=https://yourdomain.com
```

### Additional Production Features to Add
1. **Email Service Integration** (SendGrid, AWS SES)
2. **Redis for Rate Limiting** (replace in-memory store)
3. **Monitoring & Alerting** (Winston + ELK stack)
4. **Two-Factor Authentication** (TOTP/SMS)
5. **OAuth Providers** (GitHub, LinkedIn)
6. **Session Management Dashboard**
7. **Audit Logging**
8. **CSRF Protection**

## 📊 Why This Impresses Recruiters

1. **Enterprise-Level Security**: Implements industry best practices
2. **Scalable Architecture**: Clean, maintainable code structure
3. **Production-Ready**: Comprehensive error handling and logging
4. **Security Awareness**: Shows understanding of common vulnerabilities
5. **Modern Practices**: JWT, middleware patterns, service architecture
6. **Documentation**: Well-documented APIs and security features

This authentication system demonstrates advanced backend development skills that companies look for in senior developers and security-conscious applications.
