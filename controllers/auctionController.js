const Auction = require('../models/Auction');
const closeAuction = require('../utils/closeAuction');

exports.getAuctions = async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await Auction.find(filter).populate('item', 'title startingPrice image')
    .populate('highestBidder', 'name').sort('endTime'));
};

exports.getAuction = async (req, res) => {
  const a = await Auction.findById(req.params.id).populate('item').populate('highestBidder', 'name');
  if (!a) return res.status(404).json({ message: 'Auction not found' });
  res.json(a);
};

// Extra (admin): force-end an auction, handy for testing winners + notifications
exports.endAuction = async (req, res) => {
  const result = await closeAuction(req.params.id, req.app.get('io'));
  if (!result) return res.status(400).json({ message: 'Auction not found or already ended' });
  res.json(result);
};
