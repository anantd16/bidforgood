const jwt = require('jsonwebtoken');
const User = require('../models/User');
const firebase = require('../config/firebase');

exports.protect = async (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized, no token' });
  const token = h.split(' ')[1];
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
  } catch (e) {
    // fallback: Firebase ID token
    if (firebase) {
      try {
        const decoded = await firebase.auth().verifyIdToken(token);
        req.user = await User.findOne({ email: decoded.email });
      } catch (_) {}
    }
  }
  if (!req.user) return res.status(401).json({ message: 'Not authorized, invalid token' });
  next();
};

exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Forbidden: insufficient role' });
