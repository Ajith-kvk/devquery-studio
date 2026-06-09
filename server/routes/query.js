const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Connection = require('../models/Connection');
const QueryHistory = require('../models/QueryHistory');
const { decrypt } = require('../utils/encrypt');
const { runMongoQuery } = require('../services/mongoService');
const { runMysqlQuery } = require('../services/mysqlService');

// ─── POST /api/query/run ───────────────────────────────────
router.post('/run', auth, async (req, res) => {
  const { connectionId, collection, operation, params } = req.body;

  // Validate required fields
  if (!connectionId || !collection || !operation) {
    return res.status(400).json({
      message: 'connectionId, collection and operation are required'
    });
  }

  // Find the connection and make sure it belongs to this user
  const conn = await Connection.findOne({
    _id: connectionId,
    user: req.userId
  });

  if (!conn) {
    return res.status(404).json({ message: 'Connection not found' });
  }

  let result;
  let status = 'success';
  let errorMessage = '';

  try {
    // Decrypt credentials — use them, then let them go out of scope
    // They are NEVER sent back to the frontend
    const credentials = decrypt(conn.encryptedCredentials);

    if (conn.type === 'mongodb') {
      result = await runMongoQuery(
        credentials.uri,
        collection,
        operation,
        params
      );
    } else if (conn.type === 'mysql') {
      result = await runMysqlQuery(
        credentials,
        collection,
        operation,
        params
      );
    } else {
      return res.status(400).json({ message: 'Unknown DB type' });
    }

  } catch (err) {
    status = 'error';
    errorMessage = err.message;

    // Save failed query to history too
    await QueryHistory.create({
      user: req.userId,
      connection: connectionId,
      collection,
      operation,
      queryParams: params,
      resultCount: 0,
      status: 'error',
      errorMessage,
    }).catch(() => {}); // Don't crash if history save fails

    return res.status(400).json({ message: errorMessage });
  }

  // Save successful query to history
  await QueryHistory.create({
    user: req.userId,
    connection: connectionId,
    collection,
    operation,
    queryParams: params,
    resultCount: Array.isArray(result) ? result.length : 1,
    status: 'success',
  }).catch(() => {});

  res.json({ result });
});

// ─── GET /api/query/history ────────────────────────────────
router.get('/history', auth, async (req, res) => {
  try {
    const history = await QueryHistory.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('connection', 'name type');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;