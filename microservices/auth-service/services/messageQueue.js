const amqp = require('amqplib');
const winston = require('winston');

class MessageQueue {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/message-queue.log' })
            ]
        });
    }

    async init() {
        try {
            const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
            this.connection = await amqp.connect(RABBITMQ_URL);
            this.channel = await this.connection.createChannel();

            // Declare exchanges
            await this.channel.assertExchange('user_events', 'topic', { durable: true });
            await this.channel.assertExchange('auth_events', 'topic', { durable: true });

            // Declare queues
            await this.channel.assertQueue('user_registration', { durable: true });
            await this.channel.assertQueue('user_login', { durable: true });
            await this.channel.assertQueue('password_reset', { durable: true });

            this.logger.info('Message Queue initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize message queue:', error);
            // In development, continue without message queue
            if (process.env.NODE_ENV !== 'production') {
                this.logger.warn('Continuing without message queue in development mode');
                return;
            }
            throw error;
        }
    }

    async publishUserEvent(eventType, userData) {
        if (!this.channel) {
            this.logger.warn('Message queue not available, skipping event publication');
            return;
        }

        try {
            const message = {
                eventType,
                userId: userData.id,
                timestamp: new Date().toISOString(),
                data: userData
            };

            await this.channel.publish(
                'user_events',
                eventType,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );

            this.logger.info(`Published user event: ${eventType}`, { userId: userData.id });
        } catch (error) {
            this.logger.error('Failed to publish user event:', error);
        }
    }

    async publishAuthEvent(eventType, authData) {
        if (!this.channel) {
            this.logger.warn('Message queue not available, skipping event publication');
            return;
        }

        try {
            const message = {
                eventType,
                userId: authData.userId,
                timestamp: new Date().toISOString(),
                data: authData
            };

            await this.channel.publish(
                'auth_events',
                eventType,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );

            this.logger.info(`Published auth event: ${eventType}`, { userId: authData.userId });
        } catch (error) {
            this.logger.error('Failed to publish auth event:', error);
        }
    }

    // Specific event publishers
    async publishUserRegistered(user) {
        await this.publishUserEvent('user.registered', {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isGoogleUser: user.isGoogleUser
        });
    }

    async publishUserLoggedIn(user, loginInfo) {
        await this.publishAuthEvent('user.logged_in', {
            userId: user._id,
            username: user.username,
            loginTime: loginInfo.loginTime,
            ipAddress: loginInfo.ipAddress,
            userAgent: loginInfo.userAgent
        });
    }

    async publishPasswordResetRequested(user, resetToken) {
        await this.publishAuthEvent('password.reset_requested', {
            userId: user._id,
            email: user.email,
            resetToken: resetToken,
            expiresAt: user.passwordResetExpires
        });
    }

    async publishPasswordChanged(user) {
        await this.publishAuthEvent('password.changed', {
            userId: user._id,
            username: user.username,
            changeTime: new Date().toISOString()
        });
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.info('Message queue connection closed');
        } catch (error) {
            this.logger.error('Error closing message queue connection:', error);
        }
    }
}

module.exports = new MessageQueue();
