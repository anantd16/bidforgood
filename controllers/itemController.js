const Item = require('../models/Item');
const Auction = require('../models/Auction');

exports.getItems = async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await Item.find(filter).populate('seller', 'name email').sort('-createdAt'));
};

exports.getItem = async (req, res) => {
  const item = await Item.findById(req.params.id).populate('seller', 'name email');
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
};

// Creates item + its auction. Body: title, description, startingPrice, durationMinutes (default 60)
exports.createItem = async (req, res) => {
  const { title, description, image, startingPrice, durationMinutes = 60 } = req.body;
  const item = await Item.create({ title, description, image, startingPrice,
    currentBid: startingPrice, seller: req.user._id });
  const auction = await Auction.create({ item: item._id, highestBid: startingPrice,
    endTime: new Date(Date.now() + Number(durationMinutes) * 60000) });
  res.status(201).json({ item, auction });
};

const owns = (req, item) => String(item.seller) === String(req.user._id) || req.user.role === 'admin';

exports.updateItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (!owns(req, item)) return res.status(403).json({ message: 'Not your item' });
  ['title', 'description', 'image'].forEach(k => { if (req.body[k] !== undefined) item[k] = req.body[k]; });
  await item.save();
  res.json(item);
};

exports.deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (!owns(req, item)) return res.status(403).json({ message: 'Not your item' });
  await Auction.deleteMany({ item: item._id });
  await item.deleteOne();
  res.json({ message: 'Item deleted' });
};
