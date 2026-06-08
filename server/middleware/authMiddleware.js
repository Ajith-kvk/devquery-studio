const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  // Check for token in the request header
  // Frontend sends it as: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach userId so routes can use it
    next(); // Move on to the actual route handler
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};