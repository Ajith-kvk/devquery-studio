const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Connection = require('../models/Connection');
const { encrypt, decrypt } = require('../utils/encrypt');
const { testMongoConnection } = require('../services/mongoService');
const { testMysqlConnection } = require('../services/mysqlService');

// ─── GET /api/connections ──────────────────────────────────
// Get all connections for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    // Never send encryptedCredentials to the frontend
    const connections = await Connection.find({ user: req.userId })
      .select('-encryptedCredentials');
    res.json(connections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/connections ─────────────────────────────────
// Add and test a new connection
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, credentials } = req.body;
    // For MongoDB: credentials = { uri: "mongodb+srv://..." }
    // For MySQL:   credentials = { host, port, user, password, database }

    if (!name || !type || !credentials) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    // Test the connection before saving
    let collections = [];
    try {
      if (type === 'mongodb') {
        collections = await testMongoConnection(credentials.uri);
      } else if (type === 'mysql') {
        collections = await testMysqlConnection(credentials);
      }
    } catch (connErr) {
      // Connection failed — tell user exactly why
      return res.status(400).json({
        message: `Connection failed: ${connErr.message}`
      });
    }

    // Encrypt credentials before saving
    const encryptedCredentials = encrypt(credentials);

    const connection = await Connection.create({
      user: req.userId,
      name,
      type,
      encryptedCredentials,
      collections,
      status: 'connected'
    });

    // Return the saved connection WITHOUT encrypted credentials
    res.status(201).json({
      _id: connection._id,
      name: connection.name,
      type: connection.type,
      collections: connection.collections,
      status: connection.status,
      createdAt: connection.createdAt
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/connections/:id ───────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    // Make sure the connection belongs to this user
    const conn = await Connection.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!conn) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    await conn.deleteOne();
    res.json({ message: 'Connection deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;