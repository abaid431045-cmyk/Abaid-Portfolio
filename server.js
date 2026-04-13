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
    user: process.env.EMAIL_USER,    // Apka Gmail
    pass: process.env.EMAIL_PASS,    // Apka 16-char App Password
  }
});

// ─── CONTACT ROUTE ────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  // 1. Email to YOU (Admin Notification)
  const ownerMail = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: subject ? `[Portfolio] ${subject}` : `[Portfolio] New message from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:580px;margin:auto;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <div style="background:#0D1117;padding:28px 32px;border-bottom:1px solid #C8A84B;">
          <h2 style="color:#C8A84B;margin:0;font-size:22px;">New Portfolio Message</h2>
        </div>
        <div style="padding:32px; background: #fff; color: #333;">
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
          <p><strong>Message:</strong></p>
          <p style="background:#f9f9f9;padding:15px;border-radius:5px;line-height:1.6;">${message}</p>
        </div>
      </div>
    `
  };

  // 2. AUTO-REPLY TO SENDER (Professional Confirmation)
  const autoReply = {
    from: `"Abaid ur Rehman" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Thank You for Your Message – We'll Be in Touch Soon",
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #C8A84B; border-radius: 12px; padding: 40px 30px; background-color: #080C10; color: #E8EBF0; line-height: 1.8;">
        <h2 style="color: #C8A84B; margin-top: 0;">Hi ${name},</h2>
        
        <p style="font-size: 16px;">
          Thank you for reaching out! This is an automated confirmation to let you know that your message has been successfully received.
        </p>
        
        <p style="font-size: 16px;">
          I will review it shortly and get back to you as soon as possible. In the meantime, if your matter is urgent, please don't hesitate to contact me directly.
        </p>

        <div style="margin-top: 40px; border-top: 1px solid rgba(200,168,75,0.2); padding-top: 20px;">
          <p style="margin: 0; font-weight: 600; color: #C8A84B;">Warm regards,</p>
          <p style="margin: 5px 0 0; font-size: 18px;">Abaid ur Rehman</p>
          <p style="margin: 0; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">Full-Stack Software Engineer</p>
          
          <div style="margin-top: 15px; font-size: 13px;">
            <a href="https://github.com/abaid431045-cmyk" style="color:#C8A84B; text-decoration:none; margin-right:15px;">GitHub</a>
            <a href="https://www.linkedin.com/in/abaid-ur-rehman-933666400" style="color:#C8A84B; text-decoration:none; margin-right:15px;">LinkedIn</a>
            <span style="color:#6B7280;">📞 0327-0613045</span>
          </div>
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
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Portfolio server running at http://localhost:${PORT}`);
});