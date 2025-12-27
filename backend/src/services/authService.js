const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError, ConflictError } = require('../utils/errors');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

const register = async (userData) => {
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  const user = await User.create(userData);
  const token = generateToken(user.id);

  return { user, token };
};

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isMatch = await user.validatePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = generateToken(user.id);

  return { user, token };
};

const getCurrentUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  return user;
};

module.exports = {
  register,
  login,
  getCurrentUser
};
