const mongoose = require('mongoose');
module.exports = mongoose.model('Item', new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  startingPrice: { type: Number, required: true, min: 0 },
  currentBid: { type: Number, default: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'sold', 'unsold'], default: 'active' }
}, { timestamps: true }));
