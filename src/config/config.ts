import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

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
}

interface Config {
    email: EmailConfig;
}

// Validate required environment variables
const validateEnvVariables = (): void => {
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

// Email configuration with type safety
const config: Config = {
    email: {
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASSWORD || ''
        },
        tls: {
            rejectUnauthorized: false
        },
        senderName: process.env.SMTP_SENDER_NAME || 'College Management System'
    }
};

// Validate configuration
try {
    validateEnvVariables();
    
    // Log configuration (but not in production)
    if (process.env.NODE_ENV !== 'production') {
        console.log('Email Configuration:', {
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure,
            auth: {
                user: config.email.auth.user,
                password: '****'
            },
            senderName: config.email.senderName
        });
    }
} catch (error) {
    console.error('Configuration Error:', error);
    process.exit(1);
}

export default config; 