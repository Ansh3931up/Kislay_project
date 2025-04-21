import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Type definitions
interface EmailAuth {
    user: string;
    pass: string;
}

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: EmailAuth;
    tls: {
        rejectUnauthorized: boolean;
    };
    senderName: string;
    from: string;
}

// Email configuration with type safety
const emailConfig: EmailConfig = {
    // Use existing EMAIL_* variables from .env.local
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USERNAME || 'thebeliever39@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-password'
    },
    tls: {
        rejectUnauthorized: false
    },
    senderName: 'Authentication System',
    from: process.env.EMAIL_FROM || 'thebeliever39@gmail.com'
};

// Log configuration (but not in production)
if (process.env.NODE_ENV !== 'production') {
    console.log('Email Configuration:', {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
            user: emailConfig.auth.user,
            password: '****'
        },
        from: emailConfig.from,
        senderName: emailConfig.senderName
    });
}

export default emailConfig; 