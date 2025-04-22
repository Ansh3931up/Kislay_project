import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import config from '../config/config';
// import logger from './logger';
import fs from 'fs';
import path from 'path';

// Type definitions
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

interface Recipient {
    email: string;
    [key: string]: unknown;
}

interface VerificationEmailParams {
    to: string;
    name: string;
    verificationToken: string;
}

interface VerificationStatusParams {
    to: string;
    collegeName: string;
    status: 'approved' | 'rejected';
    message?: string;
}

interface InvitationEmailParams {
    email: string;
    name: string;
    department: string;
    college: string;
    invitationToken: string;
    role: string;
}

let transporter: nodemailer.Transporter | null = null;

const initializeTransporter = async (): Promise<void> => {
    try {
        console.log('Initializing email transporter with config:', {
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure,
            user: config.email.auth.user
        });
        
        transporter = nodemailer.createTransport(config.email);
        
        // Verify connection
        await transporter.verify();
        console.log('Email transporter verified successfully');
    } catch (error) {
        console.error('Failed to initialize email transporter:', error);
        throw error;
    }
};

// Register Handlebars helpers
Handlebars.registerHelper('formatDate', function(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

Handlebars.registerHelper('uppercase', function(str: string): string {
    return str ? str.toUpperCase() : '';
});

// Helper function to read email templates
const readHTMLFile = (filePath: string): string => {
    try {
        return fs.readFileSync(filePath, { encoding: 'utf-8' });
    } catch (err) {
        console.error('Error reading HTML file:', err);
        throw err;
    }
};

export const sendVerificationEmail = async ({ to, name, verificationToken }: VerificationEmailParams): Promise<nodemailer.SentMessageInfo> => {
    try {
        const templatePath = path.join(process.cwd(), 'src/templates/verification-email.html');
        const html = readHTMLFile(templatePath);
        const template = Handlebars.compile(html);
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
        
        const htmlToSend = template({
            name,
            verificationLink
        });
        
        const mailOptions = {
            from: `"${config.email.senderName}" <${config.email.auth.user}>`,
            to,
            subject: 'Verify Your Email Address',
            html: htmlToSend
        };
        
        const info = await transporter?.sendMail(mailOptions);
        console.log('Verification email sent:', info?.messageId);
        return info!;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<nodemailer.SentMessageInfo> => {
    try {
        await transporter?.verify();
        console.log('SMTP connection verified');

        const mailOptions = {
            from: `"${config.email.senderName}" <${config.email.auth.user}>`,
            to,
            subject,
            html
        };

        const info = await transporter?.sendMail(mailOptions);
        console.log('Email sent successfully:', info?.messageId);
        return info!;
    } catch (error) {
        console.error('Email service error:', error);
        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const sendBatchEmails = async (
    recipients: Recipient[],
    subject: string,
    template: string,
    dataMapper: (recipient: Recipient) => Record<string, unknown>
): Promise<PromiseSettledResult<nodemailer.SentMessageInfo>[]> => {
    try {
        const promises = recipients.map(recipient => {
            const data = dataMapper(recipient);
            return sendEmail({
                to: recipient.email,
                subject,
                html: template
            });
            console.log(data);
        });
        
        const results = await Promise.allSettled(promises);
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`Batch email results: ${successful} sent, ${failed} failed`);
        
        return results;
    } catch (error) {
        console.error('Error sending batch emails:', error);
        throw error;
    }
};

export const sendVerificationStatusEmail = async ({ to, collegeName, status, message = '' }: VerificationStatusParams): Promise<nodemailer.SentMessageInfo> => {
    try {
        const subject = status === 'approved' 
            ? 'College Verification Approved' 
            : 'College Verification Status Update';
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>College Verification Status</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
                    .status-approved { color: #4CAF50; font-weight: bold; }
                    .status-rejected { color: #f44336; font-weight: bold; }
                    .footer { margin-top: 20px; font-size: 12px; color: #777; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>College Verification Status Update</h2>
                    <p>Dear ${collegeName},</p>
                    <p>We are writing to inform you about the status of your college verification request.</p>
                    <p>Your verification status: <span class="status-${status.toLowerCase()}">${status.toUpperCase()}</span></p>
                    ${message ? `<p><strong>Additional information:</strong> ${message}</p>` : ''}
                    ${status === 'approved' 
                        ? '<p>Congratulations! Your college has been verified on our platform. You can now access all the features available to verified colleges.</p>' 
                        : '<p>If you have any questions or need further assistance, please contact our support team.</p>'}
                    <p>Thank you for your patience during this process.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message from our college verification system.</p>
                </div>
            </body>
            </html>
        `;
        
        const mailOptions = {
            from: `"${config.email.senderName}" <${config.email.auth.user}>`,
            to,
            subject,
            html: htmlContent
        };
        
        const info = await transporter?.sendMail(mailOptions);
        console.log('Verification status email sent:', info?.messageId);
        return info!;
    } catch (error) {
        console.error('Error sending verification status email:', error);
        throw error;
    }
};

export const sendInvitationEmail = async ({ email, name, department, college, invitationToken, role }: InvitationEmailParams): Promise<string> => {
    try {
        console.log('Email Service: Preparing invitation email', {
            email,
            name,
            department,
            role
        });

        const inviteUrl = `${process.env.FRONTEND_URL}/complete-registration/${invitationToken}`;
        console.log('Email Service: Generated invite URL:', inviteUrl);
        
        const mailOptions = {
            from: {
                name: process.env.SMTP_SENDER_NAME || config.email.senderName,
                address: process.env.SMTP_USER || config.email.auth.user
            },
            to: email,
            subject: `Invitation to join ${department} as ${role}`,
            html: `
                <h2>Welcome to ${college}</h2>
                <p>Dear ${name},</p>
                <p>You have been invited to join ${department} department as ${role}.</p>
                <p>To complete your registration and set up your account, please click the button below:</p>
                <a href="${inviteUrl}" style="
                    background-color: #4CAF50;
                    border: none;
                    color: white;
                    padding: 15px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    cursor: pointer;
                    border-radius: 4px;
                ">
                    Complete Registration
                </a>
                <p>Or copy and paste this URL in your browser:</p>
                <p>${inviteUrl}</p>
                <p>This invitation link will expire in 7 days.</p>
                <p>If you did not expect this invitation, please ignore this email.</p>
                <br>
                <p>Best regards,</p>
                <p>The ${college} Team</p>
            `
        };

        console.log('Email Service: Attempting to send email');
        await transporter?.sendMail(mailOptions);
        console.log('Email Service: Email sent successfully');
        
        return invitationToken;
    } catch (error) {
        console.error('Email Service Error:', error);
        throw error;
    }
};

// Initialize transporter when the module loads
initializeTransporter().catch(console.error);


export const getEmailTemplate = (templateName: string, data: Record<string, unknown>): string => {
    const templatePath = path.join(process.cwd(), 'src/templates', templateName);
    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(data);
};


// eslint-disable-next-line import/no-anonymous-default-export
export default {
    sendEmail,
    sendBatchEmails,
    sendVerificationEmail,
    sendVerificationStatusEmail,
    sendInvitationEmail,
    getEmailTemplate
}; 


