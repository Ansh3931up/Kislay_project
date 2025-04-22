import config from './config';
import { EmailConfig } from '../types/email';

// Type definitions
interface EmailServiceConfig {
    service: string;
    auth: {
        user: string;
        pass: string;
    };
    debug: boolean;
    tls: {
        rejectUnauthorized: boolean;
    };
}

// Email service configuration
export const emailConfig: EmailServiceConfig = {
    service: 'gmail',
    auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
    },
    debug: process.env.NODE_ENV !== 'production',
    tls: {
        rejectUnauthorized: false
    }
};

// Validate email configuration
const validateEmailConfig = (config: EmailServiceConfig): void => {
    if (!config.auth.user || !config.auth.pass) {
        throw new Error('Email configuration is missing required credentials');
    }
};

// Test and validate configuration
try {
    validateEmailConfig(emailConfig);
    
    // Log configuration (but not in production)
    if (process.env.NODE_ENV !== 'production') {
        console.log('Email Service Configuration:', {
            service: emailConfig.service,
            user: emailConfig.auth.user,
            debug: emailConfig.debug
        });
    }
} catch (error) {
    console.error('Email Configuration Error:', error);
    process.exit(1);
}

export default emailConfig; 