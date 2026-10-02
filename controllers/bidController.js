const Bid = require('../models/Bid');
const Item = require('../models/Item');
const Auction = require('../models/Auction');

// Shared by REST and Socket.io. Throws {status,message} on failure.
exports.placeBid = async ({ itemId, amount, user, io }) => {
  amount = Number(amount);
  const item = await Item.findById(itemId);
  if (!item) throw { status: 404, message: 'Item not found' };
  if (String(item.seller) === String(user._id)) throw { status: 403, message: 'You cannot bid on your own item' };

  // Atomic: only succeeds if auction is live and amount beats current highest
  const auction = await Auction.findOneAndUpdate(
    { item: itemId, status: 'active', endTime: { $gt: new Date() }, highestBid: { $lt: amount } },
    { highestBid: amount, highestBidder: user._id }, { new: true });
  if (!auction) throw { status: 400, message: 'Auction ended/not found or bid too low' };

  const bid = await Bid.create({ item: itemId, auction: auction._id, bidder: user._id, amount });
  await Item.findByIdAndUpdate(itemId, { currentBid: amount });

  const payload = { itemId, amount, bidder: { id: user._id, name: user.name }, at: bid.createdAt };
  if (io) io.to(String(itemId)).emit('newBid', payload);
  return { bid, auction };
};

exports.createBid = async (req, res) => {
  try {
    const { itemId, amount } = req.body;
    const result = await exports.placeBid({ itemId, amount, user: req.user, io: req.app.get('io') });
    res.status(201).json(result);
  } catch (e) { res.status(e.status || 500).json({ message: e.message }); }
};

exports.getBids = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { bidder: req.user._id };
  res.json(await Bid.find(filter).populate('item', 'title').populate('bidder', 'name').sort('-createdAt'));
};

exports.getBidsByItem = async (req, res) => {
  res.json(await Bid.find({ item: req.params.id }).populate('bidder', 'name').sort('-amount'));
};
