const Winner = require('../models/Winner');

exports.getWinners = async (req, res) => {
  const winners = await Winner.find().populate('item', 'title').populate('user', 'name email').sort('-createdAt');
  const totalFunds = winners.reduce((s, w) => s + w.amount, 0);
  res.json({ totalFunds, count: winners.length, winners });
};

exports.getWinner = async (req, res) => {
  const w = await Winner.findById(req.params.id).populate('item').populate('user', 'name email');
  if (!w) return res.status(404).json({ message: 'Winner not found' });
  res.json(w);
};
