// backend/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        // Check if email configuration is available
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email configuration not found. Password reset emails will be logged to console.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection configuration
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('Email service configuration error:', error);
            } else {
                console.log('Email service is ready to send messages');
            }
        });
    }

    async sendPasswordResetEmail(email, resetToken, username = '') {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: {
                name: 'MovieList App',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Password Reset Request - MovieList App',
            html: this.generatePasswordResetHTML(username, resetUrl, resetToken),
            text: this.generatePasswordResetText(username, resetUrl)
        };

        try {
            if (!this.transporter) {
                // Fallback: log to console if email service not configured
                console.log('\n=== PASSWORD RESET EMAIL ===');
                console.log(`To: ${email}`);
                console.log(`Subject: ${mailOptions.subject}`);
                console.log(`Reset URL: ${resetUrl}`);
                console.log(`Reset Token: ${resetToken}`);
                console.log('============================\n');
                
                return {
                    success: true,
                    message: 'Password reset token logged to console (email service not configured)',
                    resetUrl
                };
            }

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent:', info.messageId);
            
            return {
                success: true,
                message: 'Password reset email sent successfully',
                messageId: info.messageId
            };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            
            // Fallback to console logging if email fails
            console.log('\n=== PASSWORD RESET EMAIL (FALLBACK) ===');
            console.log(`To: ${email}`);
            console.log(`Reset URL: ${resetUrl}`);
            console.log(`Reset Token: ${resetToken}`);
            console.log('=======================================\n');
            
            return {
                success: false,
                message: 'Email sending failed, reset token logged to console',
                error: error.message,
                resetUrl
            };
        }
    }

    generatePasswordResetHTML(username, resetUrl, token) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - MovieList App</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .button:hover { background: #5a6fd8; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .token-info { background: #e8f4f8; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎬 MovieList App</h1>
                    <h2>Password Reset Request</h2>
                </div>
                <div class="content">
                    <h3>Hello ${username || 'User'}!</h3>
                    <p>We received a request to reset your password for your MovieList account.</p>
                    
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetUrl}" class="button">Reset My Password</a>
                    
                    <div class="warning">
                        <strong>⚠️ Important Security Information:</strong>
                        <ul>
                            <li>This link will expire in <strong>10 minutes</strong> for security reasons</li>
                            <li>This link can only be used once</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                        </ul>
                    </div>
                    
                    <div class="token-info">
                        <strong>Manual Token Entry:</strong><br>
                        If the button doesn't work, copy this token: <code>${token}</code><br>
                        And paste it on the password reset page: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password">${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password</a>
                    </div>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p>Best regards,<br>The MovieList Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>© 2025 MovieList App. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generatePasswordResetText(username, resetUrl) {
        return `
Hello ${username || 'User'}!

We received a request to reset your password for your MovieList account.

Reset your password by clicking this link: ${resetUrl}

IMPORTANT:
- This link will expire in 10 minutes for security reasons
- This link can only be used once  
- If you didn't request this reset, please ignore this email

If the link doesn't work, visit ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password and enter this token manually.

Best regards,
The MovieList Team

---
This is an automated message. Please do not reply to this email.
© 2025 MovieList App. All rights reserved.
        `;
    }

    async testEmailConnection() {
        if (!this.transporter) {
            return { success: false, message: 'Email service not configured' };
        }

        try {
            await this.transporter.verify();
            return { success: true, message: 'Email service connection successful' };
        } catch (error) {
            return { success: false, message: 'Email service connection failed', error: error.message };
        }
    }
}

module.exports = new EmailService();
