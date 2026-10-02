const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'user' });
  res.status(201).json({ token: sign(user._id), user: { id: user._id, name, email, role: user.role } });
};

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: sign(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.saveFcmToken = async (req, res) => {
  req.user.fcmToken = req.body.fcmToken;
  await req.user.save();
  res.json({ message: 'FCM token saved' });
};
