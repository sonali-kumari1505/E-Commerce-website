import nodemailer from "nodemailer";
import { ENV } from "./env.js";

let transporter = null;

if (ENV.EMAIL_USER && ENV.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: "gmail",
        host: ENV.EMAIL_HOST,
        port: ENV.EMAIL_PORT,
        secure: ENV.EMAIL_PORT === 465,
        auth: {
            user: ENV.EMAIL_USER,
            pass: ENV.EMAIL_PASS
        }
    });
}

export const sendResetPasswordEmail = async (toEmail, resetUrl) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e4e4e7; }
            .header { text-align: center; margin-bottom: 24px; }
            .title { font-size: 22px; font-weight: 700; color: #18181b; margin: 0; }
            .content { font-size: 15px; color: #3f3f46; line-height: 1.6; }
            .btn-container { text-align: center; margin: 28px 0; }
            .btn { display: inline-block; background-color: #18181b; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; }
            .footer { font-size: 12px; color: #71717a; text-align: center; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 16px; }
            .url-box { background: #f4f4f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #52525b; margin-top: 16px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">E-Mart Password Reset</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset the password for your E-Mart account. Click the button below to set a new password:</p>
                <div class="btn-container">
                    <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
                </div>
                <p>This password reset link is valid for <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
                <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                <div class="url-box">${resetUrl}</div>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} E-Mart. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    if (transporter) {
        try {
            await transporter.sendMail({
                from: ENV.EMAIL_FROM,
                to: toEmail,
                subject: "Reset your E-Mart password",
                html
            });
            console.log(`[Email] Password reset email sent to ${toEmail}`);
            return { sent: true };
        } catch (err) {
            console.error("[Email] Failed to send email via SMTP:", err?.message || err);
            console.log(`[Email Fallback] Reset link: ${resetUrl}`);
            return { sent: false, error: err?.message };
        }
    } else {
        console.log(`\n========================================`);
        console.log(`[EMAIL SIMULATOR - No EMAIL_PASS set in .env]`);
        console.log(`Recipient: ${toEmail}`);
        console.log(`Reset Link: ${resetUrl}`);
        console.log(`========================================\n`);
        return { sent: true, simulated: true };
    }
};
