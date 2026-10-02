const mongoose = require('mongoose');
module.exports = mongoose.model('Winner', new mongoose.Schema({
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true, unique: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }
}, { timestamps: true }));
