const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"Booking" <${user}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };