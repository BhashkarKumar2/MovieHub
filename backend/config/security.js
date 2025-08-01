// Security configuration constants
const SECURITY_CONFIG = {
    // JWT settings
    JWT: {
        ACCESS_TOKEN_EXPIRY: '15m',
        REFRESH_TOKEN_EXPIRY: '7d',
        ALGORITHM: 'HS256'
    },

    // Password policy
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL_CHARS: true,
        SALT_ROUNDS: 12
    },

    // Account lockout settings
    ACCOUNT_LOCKOUT: {
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 2 * 60 * 60 * 1000, // 2 hours
        LOCKOUT_AFTER_ATTEMPTS: 5
    },

    // Rate limiting
    RATE_LIMITS: {
        LOGIN: {
            WINDOW_MS: 15 * 60 * 1000, // 15 minutes
            MAX_ATTEMPTS: 5
        },
        REGISTER: {
            WINDOW_MS: 15 * 60 * 1000, // 15 minutes
            MAX_ATTEMPTS: 3
        },
        PASSWORD_RESET: {
            WINDOW_MS: 60 * 60 * 1000, // 1 hour
            MAX_ATTEMPTS: 3
        },
        GENERAL: {
            WINDOW_MS: 15 * 60 * 1000, // 15 minutes
            MAX_ATTEMPTS: 100
        }
    },

    // Session settings
    SESSION: {
        MAX_REFRESH_TOKENS: 5,
        CLEANUP_INTERVAL: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Security headers
    HEADERS: {
        CONTENT_SECURITY_POLICY: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:",
        X_FRAME_OPTIONS: 'DENY',
        X_CONTENT_TYPE_OPTIONS: 'nosniff',
        X_XSS_PROTECTION: '1; mode=block',
        REFERRER_POLICY: 'strict-origin-when-cross-origin',
        STRICT_TRANSPORT_SECURITY: 'max-age=31536000; includeSubDomains'
    },

    // Validation patterns
    PATTERNS: {
        USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    },

    // Token settings
    TOKENS: {
        PASSWORD_RESET_EXPIRY: 10 * 60 * 1000, // 10 minutes
        EMAIL_VERIFICATION_EXPIRY: 24 * 60 * 60 * 1000 // 24 hours
    }
};

module.exports = SECURITY_CONFIG;
