const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/query',       require('./routes/query'));
app.use('/api/generate',    require('./routes/generate'));

// Health check — Render uses this to confirm the server is alive
app.get('/', (req, res) => {
  res.json({ message: 'DevQuery Studio API is running' });
});

// 404 handler — catches requests to unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Global error handler — catches any unhandled errors in routes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });