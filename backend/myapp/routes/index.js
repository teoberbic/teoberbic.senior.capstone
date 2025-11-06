// routes/index.js
const router = require('express').Router();
const mongoose = require('mongoose');

router.get('/', (_req, res) => {
  res.json({ ok: true, service: 'sscd-backend' });
});

router.get('/MongoCheck', (_req, res) => {
  const states = ['disconnected','connected','connecting','disconnecting'];
  res.json({
    ok: mongoose.connection.readyState === 1,
    state: states[mongoose.connection.readyState] || 'unknown',
    db: mongoose.connection.name || null
  });
});

module.exports = router;
