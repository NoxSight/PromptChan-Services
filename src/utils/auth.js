const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index.js');

const SALT_ROUNDS = 12;
const JWT_EXPIRE_MINUTES = parseInt(process.env.JWT_EXPIRE_MINUTES) || 60;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: `${JWT_EXPIRE_MINUTES}m`,
  });
}

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'username', 'email'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  authenticateToken,
};