const nodemailer = require('nodemailer');
const transporter = require('../database/nodemailer.database');
const mailSender = async (email, title, body) => {
  try {
    let mail = await transporter.sendMail({
      from: 'Student Portal | Technical Vidya',
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    console.log('Email sent successfully:', mail.messageId);
    return mail;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
module.exports = mailSender;