# Password Reset Setup Guide

This guide will help you set up the complete password reset functionality with email sending capabilities.

## 🔧 Backend Setup

### 1. Environment Variables

Copy the `.env.example` to `.env` and configure the following email settings:

```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your email configuration:

```bash
# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-app-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:3000
```

### 2. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to **Google Account Settings** → **Security**
3. Under **"Signing in to Google"** → **App passwords**
4. Select **"Mail"** and generate a new app password
5. Use this 16-character password in `EMAIL_PASS`

### 3. Install Dependencies

The `nodemailer` package is required for sending emails:

```bash
cd backend
npm install nodemailer
```

## 📧 Email Service Features

### Automatic Fallback
- If email configuration is missing, tokens are logged to console
- If email sending fails, it gracefully falls back to console logging
- Development-friendly with detailed logging

### Email Template
- Professional HTML email design
- Includes security warnings and instructions
- Mobile-responsive layout
- 10-minute token expiration notice

### Security Features
- Tokens expire in 10 minutes
- One-time use tokens
- Secure token generation
- Rate limiting on reset requests

## 🎨 Frontend Features

### Forgot Password Page (`/forgot-password`)
- Clean, modern UI with animated background
- Email validation
- Success/error states
- Development mode shows reset tokens

### Reset Password Page (`/reset-password`)
- Token auto-extraction from URL
- Password strength indicator
- Real-time password matching
- Security requirements enforcement

### Enhanced Login Page
- "Forgot Password" link added
- Success message handling
- Better error message display

## 🚀 Usage Flow

### For Users:
1. Click **"Forgot your password?"** on login page
2. Enter email address and click **"Send Reset Link"**
3. Check email for reset link (check spam folder)
4. Click link or manually enter token on reset page
5. Create new password with strength requirements
6. Login with new password

### For Developers:
1. Backend logs reset tokens to console in development
2. Email service gracefully handles configuration issues
3. Frontend shows detailed error messages for debugging

## 🔒 Security Considerations

### Production Setup:
- Use environment-specific email credentials
- Set `NODE_ENV=production` to hide debug tokens
- Configure proper CORS settings
- Use HTTPS for reset links
- Monitor failed login attempts

### Email Providers:
- **Gmail**: Requires app passwords with 2FA
- **Outlook**: Use `smtp-mail.outlook.com:587`
- **Yahoo**: Use `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Configure host/port accordingly

## 🧪 Testing

### Development Testing:
```bash
# Start backend (from backend directory)
npm start

# Start frontend (from frontend directory)
npm start

# Test the flow:
# 1. Go to http://localhost:3000/login
# 2. Click "Forgot your password?"
# 3. Enter an email that exists in your database
# 4. Check console for reset token (if email not configured)
# 5. Go to http://localhost:3000/reset-password?token=YOUR_TOKEN
# 6. Set new password and test login
```

### Production Testing:
1. Configure real email credentials
2. Test with valid email addresses
3. Verify email delivery and spam folder
4. Test token expiration (10 minutes)
5. Test security restrictions

## 📊 API Endpoints

### Request Password Reset
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
```

### Reset Password
```
POST /api/auth/reset-password
Body: { 
  "token": "reset-token-here", 
  "newPassword": "newSecurePassword123!" 
}
```

## 🎯 Enterprise Features

This implementation demonstrates:
- **Professional Email Templates**: HTML emails with branding
- **Security Best Practices**: Token expiration, rate limiting
- **Error Handling**: Graceful fallbacks and user feedback
- **Modern UI/UX**: Responsive design with accessibility
- **Development Tools**: Console logging and debug modes
- **Production Ready**: Environment-based configuration

Perfect for demonstrating enterprise development skills in campus placements! 🎓

## 🛠️ Troubleshooting

### Common Issues:

1. **"Email sending failed"**
   - Check Gmail app password (16 characters)
   - Verify 2FA is enabled
   - Check SMTP settings

2. **"Reset token invalid"**
   - Token expired (10 minutes)
   - Token already used
   - Check backend logs for token generation

3. **"Frontend not receiving emails"**
   - Check spam folder
   - Verify email address exists in database
   - Check backend console for fallback logs

4. **"Password too weak"**
   - Must be 8+ characters
   - Include uppercase, lowercase, numbers, symbols
   - Password strength indicator guides users

Need help? Check the backend console logs for detailed debugging information!
