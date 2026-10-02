require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
require('./config/firebase');
const Auction = require('./models/Auction');
const closeAuction = require('./utils/closeAuction');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);
require('./sockets/bidSocket')(io);

app.get('/', (req, res) => res.json({ message: 'BidForGood API running' }));
app.use('/api', require('./routes'));

// Error handling
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

// Auto-close expired auctions every 15s
setInterval(async () => {
  try {
    const expired = await Auction.find({ status: 'active', endTime: { $lte: new Date() } });
    for (const a of expired) await closeAuction(a._id, io);
  } catch (e) { console.error('Scheduler error:', e.message); }
}, 15000);

const PORT = process.env.PORT || 5000;
connectDB().then(() => server.listen(PORT, () => console.log(`Server on port ${PORT}`)))
  .catch(e => { console.error('DB connection failed:', e.message); process.exit(1); });
