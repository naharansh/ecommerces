const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User, Cart } = require('../models');

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

const register = async ({ name, email, password, phone }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered.');
    error.statusCode = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password_hash, phone });

  await Cart.create({ user_id: user.id });

  const tokens = generateTokens(user);
  await user.update({ refresh_token: tokens.refreshToken });

  const userData = user.toJSON();
  delete userData.password_hash;
  delete userData.refresh_token;

  return { user: userData, ...tokens };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (user.role === 'vendor') {
    const error = new Error('Vendor accounts are managed by the admin. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  if (user.locked_until && new Date() < new Date(user.locked_until)) {
    const error = new Error('Account is locked. Try again later.');
    error.statusCode = 423;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const attempts = user.failed_login_attempts + 1;
    const updateData = { failed_login_attempts: attempts };
    if (attempts >= 5) {
      updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.update(updateData);
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  await user.update({
    failed_login_attempts: 0,
    locked_until: null,
    last_login: new Date(),
  });

  const tokens = generateTokens(user);
  await user.update({ refresh_token: tokens.refreshToken });

  const userData = user.toJSON();
  delete userData.password_hash;
  delete userData.refresh_token;

  return { user: userData, ...tokens };
};

const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refresh_token !== token) {
      const error = new Error('Invalid refresh token.');
      error.statusCode = 401;
      throw error;
    }

    const tokens = generateTokens(user);
    await user.update({ refresh_token: tokens.refreshToken });

    return tokens;
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error('Invalid or expired refresh token.');
    error.statusCode = 401;
    throw error;
  }
};

const logout = async (userId) => {
  await User.update({ refresh_token: null }, { where: { id: userId } });
};

module.exports = { register, login, refreshToken, logout, generateTokens };
