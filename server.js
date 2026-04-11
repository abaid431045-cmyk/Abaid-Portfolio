const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── EMAIL TRANSPORTER ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,    // your Gmail: abaid.rehman.pk@gmail.com
    pass: process.env.EMAIL_PASS,    // Gmail App Password (16-char)
  }
});

// ─── CONTACT ROUTE ────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  // Email to YOU (portfolio owner)
  const ownerMail = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: subject ? `[Portfolio] ${subject}` : `[Portfolio] New message from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:580px;margin:auto;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <div style="background:#0D0D14;padding:28px 32px;">
          <h2 style="color:#C9A84C;margin:0;font-size:22px;">New Portfolio Message</h2>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;font-size:13px;width:100px;">From</td><td style="padding:8px 0;font-weight:600;color:#111;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:13px;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#C9A84C;">${email}</a></td></tr>
            ${subject ? `<tr><td style="padding:8px 0;color:#666;font-size:13px;">Subject</td><td style="padding:8px 0;color:#111;">${subject}</td></tr>` : ''}
          </table>
          <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0;">
          <p style="color:#444;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
        </div>
        <div style="background:#f9f9f9;padding:16px 32px;font-size:12px;color:#999;">
          Sent from your portfolio website · abaid.rehman.pk
        </div>
      </div>
    `
  };

  // Auto-reply to SENDER
  const autoReply = {
    from: `"Abaid ur Rehman" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Thanks for reaching out — Abaid ur Rehman',
    html: `
      <div style="font-family:sans-serif;max-width:580px;margin:auto;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <div style="background:#0D0D14;padding:28px 32px;">
          <h2 style="color:#C9A84C;margin:0;font-size:22px;">Message Received!</h2>
        </div>
        <div style="padding:32px;">
          <p style="color:#333;font-size:15px;line-height:1.7;">Hi <strong>${name}</strong>,</p>
          <p style="color:#555;font-size:14px;line-height:1.8;margin-top:12px;">
            Thank you for getting in touch! I've received your message and will get back to you within <strong>24 hours</strong>.
          </p>
          <p style="color:#555;font-size:14px;line-height:1.8;margin-top:12px;">
            Meanwhile, feel free to reach me directly at:<br>
            📞 <strong>+92 327-0613045</strong>
          </p>
          <div style="margin-top:28px;padding:20px;background:#fafaf7;border-radius:6px;border-left:3px solid #C9A84C;">
            <p style="margin:0;font-size:13px;color:#888;">Your message:</p>
            <p style="margin:8px 0 0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </div>
        </div>
        <div style="background:#0D0D14;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#C9A84C;font-size:14px;font-weight:600;">Abaid ur Rehman</p>
          <p style="margin:4px 0 0;color:#666;font-size:12px;">Full Stack Developer · Pakistan</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(ownerMail);
    await transporter.sendMail(autoReply);
    res.json({ success: true, message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send email. Please try again.' });
  }
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Portfolio server running at http://localhost:${PORT}`);
});
