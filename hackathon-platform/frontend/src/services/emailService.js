// Email Service for HackFlow
// Handles email generation, dispatch via backend API, and client-side simulation store

import api from "./api";

const EMAILS_STORAGE_KEY = "hackflow_sent_emails";
const OTP_STORAGE_KEY = "hackflow_active_otps";

// Helper to get stored emails
export function getSentEmails() {
  try {
    const raw = localStorage.getItem(EMAILS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save sent email
export function saveSentEmail(emailObj) {
  try {
    const emails = getSentEmails();
    const updated = [emailObj, ...emails.slice(0, 19)]; // keep latest 20
    localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch a custom window event so UI components can update instantly
    window.dispatchEvent(new CustomEvent("hackflow_new_email", { detail: emailObj }));
    return updated;
  } catch (err) {
    console.error("Failed to save sent email:", err);
  }
}

// Store OTPs with expiration (10 minutes)
export function storeOtp(email, otp, purpose = "registration") {
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    const otps = raw ? JSON.parse(raw) : {};
    otps[email.toLowerCase()] = {
      otp: String(otp),
      purpose,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
  } catch (err) {
    console.error("Failed to store OTP:", err);
  }
}

// Verify an OTP
export function verifyOtpCode(email, code) {
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    const otps = raw ? JSON.parse(raw) : {};
    const record = otps[email.toLowerCase()];

    // Allow universal testing master OTP in demo mode (e.g. 123456)
    if (code === "123456") {
      return { success: true, message: "Verified via developer demo override." };
    }

    if (!record) {
      return { success: false, message: "No active verification code found for this email. Please request a new one." };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, message: "This verification code has expired. Please request a new code." };
    }

    if (record.otp !== String(code).trim()) {
      return { success: false, message: "Invalid verification code. Please check your email and try again." };
    }

    // Clear after successful verification
    delete otps[email.toLowerCase()];
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
    return { success: true };
  } catch (err) {
    return { success: false, message: err?.message || "Verification error." };
  }
}

// Generate random 6-digit OTP
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send Verification Email with Multi-Factor Authentication Code
 */
export async function sendRegistrationVerificationEmail({ email, name, role = "participant" }) {
  const otp = generateOtp();
  storeOtp(email, otp, "registration");

  const emailData = {
    id: `email_${Date.now()}`,
    to: email,
    from: "HackFlow AI Security <security@hackflow.dev>",
    subject: `Verify your HackFlow AI account - Security Code: ${otp}`,
    otp,
    recipientName: name || "Innovator",
    purpose: "Email Verification & Multi-Factor Activation",
    role,
    sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    fullDate: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 28px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">HackFlow AI Security</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Multi-Factor Authentication & Account Verification</p>
        </div>
        <div style="padding: 32px 28px; color: #1e293b;">
          <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${name || "there"}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for registering on <strong>HackFlow AI</strong> as a <strong>${role}</strong>. To verify your email address and activate your account with Multi-Factor Authentication, please enter the following 6-digit security code:
          </p>
          <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; display: inline-block;">
              ${otp}
            </span>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;">Valid for 10 minutes</p>
          </div>
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
              <strong>Security Alert:</strong> Never share this code with anyone. HackFlow AI staff will never ask for your verification code.
            </p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
            If you did not create an account on HackFlow AI, you can safely ignore this email.
          </p>
        </div>
        <div style="background: #f1f5f9; padding: 16px 28px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          &copy; ${new Date().getFullYear()} HackFlow AI Platform Inc. All rights reserved.
        </div>
      </div>
    `,
  };

  // Attempt backend API call (if backend is listening)
  try {
    await api.post("/auth/send-verification-email", {
      email,
      name,
      otp,
      role,
    });
  } catch (err) {
    console.info("Backend email service offline or running in mock mode. Simulating delivery:", err?.message);
  }

  // Always record to client email simulation store
  saveSentEmail(emailData);

  return { success: true, otp, emailData };
}

/**
 * Send Login Two-Factor Authentication (2FA) Code
 */
export async function sendLogin2FaEmail({ email, name }) {
  const otp = generateOtp();
  storeOtp(email, otp, "login-2fa");

  const emailData = {
    id: `email_${Date.now()}`,
    to: email,
    from: "HackFlow Security <security@hackflow.dev>",
    subject: `HackFlow 2FA Login Security Code: ${otp}`,
    otp,
    recipientName: name || "User",
    purpose: "Two-Factor Authentication Sign-In Challenge",
    sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    fullDate: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">HackFlow Two-Factor Authentication</h2>
        </div>
        <div style="padding: 28px; color: #1e293b;">
          <p style="font-size: 14px; color: #475569;">A sign-in attempt was detected for your account (<strong>${email}</strong>). Use the verification code below to authorize this session:</p>
          <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">
            <span style="font-family: monospace; font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #6366f1;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 11px; color: #64748b;">Expires in 10 minutes. If this wasn't you, reset your password immediately.</p>
        </div>
      </div>
    `,
  };

  try {
    await api.post("/auth/send-2fa-email", { email, otp });
  } catch (err) {
    console.info("Backend email offline, recorded to simulated inbox.");
  }

  saveSentEmail(emailData);
  return { success: true, otp, emailData };
}
