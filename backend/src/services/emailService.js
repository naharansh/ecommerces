const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (config.nodeEnv === 'development') {
    logger.info(`Email would be sent to ${to}: ${subject}`);
    return { messageId: 'dev-mode' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"ShopWave" <${config.smtp.user}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send failed:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to ShopWave!',
    html: `<h1>Welcome, ${user.name}!</h1><p>Thank you for registering at ShopWave.</p>`,
  });
};

const sendOrderConfirmation = async (order, user) => {
  return sendEmail({
    to: user.email,
    subject: `Order Confirmed - ${order.order_number}`,
    html: `<h1>Order Confirmed!</h1><p>Your order #${order.order_number} has been placed.</p><p>Total: $${order.total_amount}</p>`,
  });
};

const sendPasswordReset = async (user, token) => {
  const resetUrl = `${config.frontendUrl}/auth/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `<h1>Password Reset</h1><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendOrderConfirmation, sendPasswordReset };
