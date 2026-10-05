const nodemailer = require('nodemailer');
const db = require('../config/db');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  const isPlaceholder = !user || !pass || 
    user === 'your-email@gmail.com' || 
    user === 'your_email@gmail.com' ||
    pass === 'your-app-password' || 
    pass === 'your_app_password';

  if (!isPlaceholder) {
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: user.trim(),
          pass: pass.trim().replace(/\s+/g, ''), // strip any spaces in Gmail app passwords
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });

      console.log(`[INFO] Initialized SMTP Transporter for host: ${host} (User: ${user})`);
    } catch (err) {
      console.error('[ERROR] Failed to initialize Nodemailer transporter:', err.message);
      transporter = createFallbackTransporter();
    }
  } else {
    transporter = createFallbackTransporter();
    console.log('\n[INFO] Nodemailer running in Simulation Mode.');
    console.log('[TIP] To send real emails to inboxes, add your Gmail & App Password (EMAIL_USER & EMAIL_PASS) in .env or Railway variables.\n');
  }

  return transporter;
};

function createFallbackTransporter() {
  return {
    sendMail: async (opts) => {
      console.log(`\n======================================================`);
      console.log(`[EMAIL SIMULATION DISPATCH]`);
      console.log(`To:      ${opts.to}`);
      console.log(`Subject: ${opts.subject}`);
      console.log(`Time:    ${new Date().toLocaleTimeString()}`);
      console.log(`======================================================\n`);
      return { messageId: `simulated_msg_${Date.now()}` };
    }
  };
}

/**
 * Send 6-Digit MFA Verification Email for Account Registration
 */
async function sendVerificationEmail({ to, name, otp, role }) {
  console.log(`\n[INFO] [MFA OTP DISPATCH] Email: ${to} | 6-Digit Code: ${otp}`);

  // Save to database records so it can be queried or verified anytime
  try {
    db.insert('emails', {
      to,
      subject: `Verify your HackFlow account - Security Code: ${otp}`,
      otp,
      purpose: 'registration-verification',
      sentAt: new Date().toISOString(),
    });
  } catch (e) {
    // Non-fatal
  }

  const mailer = await getTransporter();
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 28px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">HackFlow Security</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Multi-Factor Authentication & Account Verification</p>
      </div>
      <div style="padding: 32px 28px; color: #1e293b;">
        <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${name || "there"}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
          Thank you for registering on <strong>HackFlow</strong> as a <strong>${role || "participant"}</strong>. Use the 6-digit security code below to verify your email and activate your account:
        </p>
        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; display: inline-block;">
            ${otp}
          </span>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;">Valid for 10 minutes</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          If you did not register for an account, please disregard this email.
        </p>
      </div>
      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} HackFlow Platform Inc. All rights reserved.
      </div>
    </div>
  `;

  const senderAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"HackFlow Security" <${process.env.EMAIL_USER || 'no-reply@hackflow.dev'}>`;

  try {
    const info = await mailer.sendMail({
      from: senderAddress,
      to,
      subject: `Verify your HackFlow account - Security Code: ${otp}`,
      html: htmlContent,
    });
    console.log(`[SUCCESS] Verification email sent to ${to}. Message ID: ${info.messageId}`);
  } catch (err) {
    console.error(`[ERROR] Failed to send real email to ${to}:`, err.message);
    console.warn(`[NOTICE] The OTP code is: ${otp}. You can enter it on the verification screen.`);
  }

  return { success: true, otp };
}

/**
 * Send 6-Digit MFA Verification Email for 2FA Login
 */
async function sendLogin2FaEmail({ to, name, otp }) {
  console.log(`\n[INFO] [2FA LOGIN OTP DISPATCH] Email: ${to} | 6-Digit Code: ${otp}`);

  const mailer = await getTransporter();
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">HackFlow Two-Factor Authentication</h2>
      </div>
      <div style="padding: 28px; color: #1e293b;">
        <p style="font-size: 14px; color: #475569;">Hello <strong>${name || 'Innovator'}</strong>,</p>
        <p style="font-size: 14px; color: #475569;">A sign-in attempt was detected for your account (<strong>${to}</strong>). Use the verification code below to authorize this session:</p>
        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-family: monospace; font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #6366f1;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 11px; color: #64748b;">Expires in 10 minutes. If this wasn't you, please change your password immediately.</p>
      </div>
    </div>
  `;

  const senderAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"HackFlow Security" <${process.env.EMAIL_USER || 'no-reply@hackflow.dev'}>`;

  try {
    await mailer.sendMail({
      from: senderAddress,
      to,
      subject: `HackFlow 2FA Login Security Code: ${otp}`,
      html: htmlContent,
    });
  } catch (err) {
    console.error(`[ERROR] Failed to send 2FA email: ${err.message}`);
  }

  return { success: true, otp };
}

module.exports = {
  sendVerificationEmail,
  sendLogin2FaEmail,
  getTransporter
};
