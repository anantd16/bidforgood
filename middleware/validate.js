const mongoose = require('mongoose');
// validate({ field: 'string'|'number'|'email' }) -> required-field + type checks
exports.validate = (rules) => (req, res, next) => {
  const errors = [];
  for (const [f, t] of Object.entries(rules)) {
    const v = req.body[f];
    if (v === undefined || v === '') { errors.push(`${f} is required`); continue; }
    if (t === 'number' && (isNaN(Number(v)) || Number(v) < 0)) errors.push(`${f} must be a positive number`);
    if (t === 'email' && !/^\S+@\S+\.\S+$/.test(v)) errors.push(`${f} must be a valid email`);
    if (t === 'id' && !mongoose.isValidObjectId(v)) errors.push(`${f} must be a valid id`);
  }
  if (errors.length) return res.status(400).json({ errors });
  next();
};
exports.validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: 'Invalid id' });
