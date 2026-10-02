const User = require('../models/User');
const notify = require('../utils/notify');

exports.send = async (req, res) => {
  const { userId, title, body } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(await notify(user, title, body));
};
