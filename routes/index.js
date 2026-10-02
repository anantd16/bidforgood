const router = require('express').Router();
const wrap = require('../utils/asyncWrap');
const { protect, authorize } = require('../middleware/auth');
const { validate, validId } = require('../middleware/validate');
const auth = require('../controllers/authController');
const items = require('../controllers/itemController');
const bids = require('../controllers/bidController');
const auctions = require('../controllers/auctionController');
const winners = require('../controllers/winnerController');
const notif = require('../controllers/notificationController');

// Auth
router.post('/auth/register', validate({ name: 'string', email: 'email', password: 'string' }), wrap(auth.register));
router.post('/auth/login', validate({ email: 'email', password: 'string' }), wrap(auth.login));
router.put('/auth/fcm-token', protect, validate({ fcmToken: 'string' }), wrap(auth.saveFcmToken));

// Items
router.get('/items', wrap(items.getItems));
router.get('/items/:id', validId, wrap(items.getItem));
router.post('/items', protect, validate({ title: 'string', startingPrice: 'number' }), wrap(items.createItem));
router.put('/items/:id', protect, validId, wrap(items.updateItem));
router.delete('/items/:id', protect, validId, wrap(items.deleteItem));

// Bids
router.post('/bids', protect, validate({ itemId: 'id', amount: 'number' }), wrap(bids.createBid));
router.get('/bids', protect, wrap(bids.getBids));
router.get('/bids/item/:id', validId, wrap(bids.getBidsByItem));

// Auctions
router.get('/auctions', wrap(auctions.getAuctions));
router.get('/auctions/:id', validId, wrap(auctions.getAuction));
router.post('/auctions/:id/end', protect, authorize('admin'), validId, wrap(auctions.endAuction));

// Winners
router.get('/winners', wrap(winners.getWinners));
router.get('/winners/:id', validId, wrap(winners.getWinner));

// Notifications
router.post('/notifications/send', protect, authorize('admin'),
  validate({ userId: 'id', title: 'string', body: 'string' }), wrap(notif.send));

module.exports = router;
