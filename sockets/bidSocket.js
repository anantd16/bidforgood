const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { placeBid } = require('../controllers/bidController');

module.exports = (io) => {
  // Optional auth: client sends { auth: { token } } when connecting
  io.use(async (socket, next) => {
    try {
      const t = socket.handshake.auth && socket.handshake.auth.token;
      if (t) socket.user = await User.findById(jwt.verify(t, process.env.JWT_SECRET).id);
    } catch (_) {}
    next();
  });

  io.on('connection', (socket) => {
    socket.on('joinAuction', (itemId) => socket.join(String(itemId)));
    socket.on('leaveAuction', (itemId) => socket.leave(String(itemId)));
    socket.on('placeBid', async ({ itemId, amount }, ack) => {
      try {
        if (!socket.user) throw { message: 'Authentication required' };
        await placeBid({ itemId, amount, user: socket.user, io });
        ack && ack({ ok: true });
      } catch (e) { ack && ack({ ok: false, message: e.message }); }
    });
  });
};
