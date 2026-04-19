import express from 'express';
import { sendMail } from '../utils/sendMail.js';

const router = express.Router();

/* GET /contact — render the contact page */
router.get('/', (req, res) => {
    res.render('contact');
});

/* POST /contact — handle form submission, send email to site owner */
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, subject, message } = req.body;

        // Basic server-side validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ status: 'fail', message: 'Please fill in all required fields.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid email address.' });
        }

        if (message.trim().length < 10) {
            return res.status(400).json({ status: 'fail', message: 'Message must be at least 10 characters.' });
        }

        // Email to the site owner
        const ownerOptions = {
            email: process.env.GMAIL,           // sent TO the owner's Gmail
            subject: `[WanderSmart Contact] ${subject} — from ${name}`,
            message: `
New contact message from WanderSmart website:

Name:    ${name}
Email:   ${email}
Phone:   ${phone || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
Reply directly to this email to respond to ${name}.
            `.trim(),
            html: `
<div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:auto;background:#1a1a1a;color:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#085041,#1D9E75);padding:28px 32px;">
    <h2 style="margin:0;font-size:22px;font-family:Georgia,serif;">📬 New Contact Message</h2>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">WanderSmart — Contact Form Submission</p>
  </div>
  <div style="padding:28px 32px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:8px 0;color:#aaa;width:90px;">Name</td>
        <td style="padding:8px 0;font-weight:500;">${name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#aaa;">Email</td>
        <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#1D9E75;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#aaa;">Phone</td>
        <td style="padding:8px 0;">${phone || '—'}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#aaa;">Subject</td>
        <td style="padding:8px 0;">${subject}</td>
      </tr>
    </table>
    <hr style="border:none;border-top:1px solid #333;margin:20px 0;" />
    <p style="color:#aaa;font-size:12px;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">Message</p>
    <p style="font-size:15px;line-height:1.7;color:#eee;white-space:pre-wrap;">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
    <hr style="border:none;border-top:1px solid #333;margin:20px 0;" />
    <p style="font-size:12px;color:#666;">Reply directly to this email to respond to ${name} at ${email}.</p>
  </div>
</div>
            `
        };

        // Auto-reply to the user
        const userOptions = {
            email: email,
            subject: `We received your message — WanderSmart`,
            message: `Hi ${name},\n\nThank you for contacting WanderSmart! We have received your message and our team will get back to you within 24 hours.\n\nSubject: ${subject}\n\nBest regards,\nThe WanderSmart Team`,
            html: `
<div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:auto;background:#1a1a1a;color:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#085041,#1D9E75);padding:28px 32px;">
    <h2 style="margin:0;font-size:22px;font-family:Georgia,serif;">✅ Message Received!</h2>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">WanderSmart Support</p>
  </div>
  <div style="padding:28px 32px;">
    <p style="font-size:16px;margin-bottom:16px;">Hi <strong>${name}</strong>,</p>
    <p style="color:#ccc;line-height:1.7;font-size:14px;">
      Thank you for contacting <strong style="color:#1D9E75;">WanderSmart</strong>! We've received your message
      and our support team will get back to you within <strong>24 hours</strong>.
    </p>
    <div style="background:#242424;border-radius:8px;padding:16px 20px;margin:20px 0;border-left:3px solid #1D9E75;">
      <p style="margin:0;font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:.05em;">Your subject</p>
      <p style="margin:6px 0 0;font-size:15px;">${subject}</p>
    </div>
    <p style="color:#aaa;font-size:13px;line-height:1.6;">
      In the meantime, feel free to explore <a href="https://college-project-int222.onrender.com" style="color:#1D9E75;">WanderSmart</a>
      to discover destinations, hotels, and tour packages.
    </p>
    <hr style="border:none;border-top:1px solid #333;margin:24px 0;" />
    <p style="font-size:12px;color:#555;">© 2024 WanderSmart — Smart Tourism Platform</p>
  </div>
</div>
            `
        };

        // Send both emails
        await Promise.all([
            sendMail(ownerOptions),
            sendMail(userOptions)
        ]);

        res.status(200).json({ status: 'success', message: 'Message sent successfully.' });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ status: 'error', message: 'Failed to send message. Please try again later.' });
    }
});

export default router;
