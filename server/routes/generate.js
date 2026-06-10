const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Connection = require('../models/Connection');
const { generateRoute } = require('../utils/routeGenerator');

// ─── POST /api/generate/route ──────────────────────────────
router.post('/route', auth, async (req, res) => {
  try {
    const { connectionId, collection, operations } = req.body;

    if (!connectionId || !collection || !operations || operations.length === 0) {
      return res.status(400).json({
        message: 'connectionId, collection and operations are required'
      });
    }

    // Verify the connection belongs to this user
    const conn = await Connection.findOne({
      _id: connectionId,
      user: req.userId
    });

    if (!conn) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Generate the route code
    const code = generateRoute(collection, conn.type, operations);

    res.json({
      code,
      filename: `${collection}.js`,
      dbType: conn.type,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;