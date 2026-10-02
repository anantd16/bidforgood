const Auction = require('../models/Auction');
const Item = require('../models/Item');
const Winner = require('../models/Winner');
const User = require('../models/User');
const notify = require('./notify');

// Atomically ends an auction (safe against double-closing)
module.exports = async function closeAuction(auctionId, io) {
  const auction = await Auction.findOneAndUpdate(
    { _id: auctionId, status: 'active' }, { status: 'ended' }, { new: true });
  if (!auction) return null;
  let winner = null;
  if (auction.highestBidder) {
    winner = await Winner.create({ auction: auction._id, item: auction.item,
      user: auction.highestBidder, amount: auction.highestBid });
    await Item.findByIdAndUpdate(auction.item, { status: 'sold' });
    const user = await User.findById(auction.highestBidder);
    const item = await Item.findById(auction.item);
    await notify(user, 'You won! 🎉', `You won "${item.title}" with a bid of ${auction.highestBid}`);
  } else {
    await Item.findByIdAndUpdate(auction.item, { status: 'unsold' });
  }
  if (io) io.to(String(auction.item)).emit('auctionEnded', { itemId: auction.item, winner });
  return { auction, winner };
};
