const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Pavankumar903222@',
  database: 'login',
});

router.post('forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    await db.query('UPDATE users SET password_reset_token = ? WHERE email = ?', [token, email]);
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'polisettymadhupavan1@gmail.com',
        pass: 'ogzufytchmvdgdhu',
      },
    });
    const mailOptions = {
      from: 'polisettymadhupavan1@gmail.com',
      to: email,

      subject: 'Password Reset',
      html: `
        <p>Click the link to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset Password</a>
      `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.json({ message: 'Password reset link sent to your email' })
      }
      console.log('Password reset email sent!');
      res.json({ success: true });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;