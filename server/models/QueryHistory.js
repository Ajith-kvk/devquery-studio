const mongoose = require('mongoose');

const queryHistorySchema = new mongoose.Schema(
  {
    // Who ran this query
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Which connection was used
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connection',
      required: true
    },
    collection: { type: String, required: true },
    operation:  { type: String, required: true },
    queryParams: { type: Object },
    // Store the result summary (not full data — could be huge)
    resultCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['success', 'error'],
      default: 'success'
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QueryHistory', queryHistorySchema);