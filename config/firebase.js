const fs = require('fs');
const path = require('path');
let admin = null;
const p = process.env.FIREBASE_SERVICE_ACCOUNT;
if (p && fs.existsSync(path.resolve(p))) {
  const fb = require('firebase-admin');
  fb.initializeApp({ credential: fb.credential.cert(require(path.resolve(p))) });
  admin = fb;
  console.log('Firebase initialized');
} else {
  console.log('Firebase not configured (push/Firebase Auth disabled)');
}
module.exports = admin;
