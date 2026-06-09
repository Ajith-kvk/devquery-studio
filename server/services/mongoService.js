const mongoose = require('mongoose');

// Test a MongoDB URI and return list of collection names
async function testMongoConnection(uri) {
  // Create a separate connection (not the app's main connection)
  const conn = await mongoose.createConnection(uri).asPromise();
  const collections = await conn.db.listCollections().toArray();
  await conn.close(); // Always close after use
  return collections.map((c) => c.name);
}

// Run a query on a user's MongoDB database
async function runMongoQuery(uri, collection, operation, params = {}) {
  const conn = await mongoose.createConnection(uri).asPromise();
  const col = conn.db.collection(collection);
  let result;

  try {
    switch (operation) {
      case 'find':
        result = await col
          .find(params.filter || {})
          .limit(50)
          .toArray();
        break;
      case 'insert':
        result = await col.insertOne(params.data || {});
        break;
      case 'update':
        result = await col.updateMany(
          params.filter || {},
          { $set: params.data || {} }
        );
        break;
      case 'delete':
        result = await col.deleteMany(params.filter || {});
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    await conn.close(); // Close even if query fails
  }

  return result;
}

module.exports = { testMongoConnection, runMongoQuery };