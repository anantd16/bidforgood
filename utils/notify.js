const firebase = require('../config/firebase');
module.exports = async (user, title, body) => {
  if (!user || !user.fcmToken || !firebase) {
    console.log(`[notify:skipped] ${user ? user.email : 'n/a'} -> ${title}: ${body}`);
    return { sent: false };
  }
  try {
    await firebase.messaging().send({ token: user.fcmToken, notification: { title, body } });
    return { sent: true };
  } catch (e) {
    console.error('FCM error:', e.message);
    return { sent: false, error: e.message };
  }
};
