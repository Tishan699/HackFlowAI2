const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'tishanarunalu435@gmail.com',
    pass: 'pkiwdtvgkzexscev'
  },
  tls: { rejectUnauthorized: false }
});

transporter.sendMail({
  from: 'HackFlow AI <tishanarunalu435@gmail.com>',
  to: 'tishanarunalu435@gmail.com',
  subject: 'HackFlow - Your Verification Code: 654321',
  html: `
    <div style="font-family:Arial;max-width:500px;margin:0 auto;padding:24px;background:#0f172a;color:white;border-radius:12px">
      <h2 style="color:#f97316;margin:0 0 16px 0">HackFlow AI Verification</h2>
      <p style="color:#cbd5e1">Your one-time verification code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#f97316;background:#1e293b;padding:16px;border-radius:8px;text-align:center">
        654321
      </div>
      <p style="font-size:12px;color:#64748b;margin-top:16px">Valid for 10 minutes. Do not share this code with anyone.</p>
    </div>
  `
}, (err, info) => {
  if (err) {
    console.error('FAILED:', err.message);
  } else {
    console.log('SUCCESS! Email sent:', info.messageId);
    console.log('Check your Gmail inbox for code: 654321');
  }
});
