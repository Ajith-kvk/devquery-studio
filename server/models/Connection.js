const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    // Which user owns this connection
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Friendly name like "My App DB"
    name: {
      type: String,
      required: true,
      trim: true
    },
    // mongodb or mysql
    type: {
      type: String,
      enum: ['mongodb', 'mysql'],
      required: true
    },
    // Credentials stored as encrypted string — NEVER plain text
    encryptedCredentials: {
      type: String,
      required: true
    },
    // Collection/table names fetched after successful connection
    collections: [{ type: String }],

    status: {
      type: String,
      enum: ['connected', 'failed', 'untested'],
      default: 'untested'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Connection', connectionSchema);