const mongoose = require('mongoose');

async function testMongoConnection(uri) {
  const conn = await mongoose.createConnection(uri).asPromise();
  const collections = await conn.db.listCollections().toArray();
  await conn.close();
  return collections.map((c) => c.name);
}

async function runMongoQuery(uri, collection, operation, params = {}) {
  const conn = await mongoose.createConnection(uri).asPromise();
  const col = conn.db.collection(collection);
  let result;

  try {
    // Clean up empty filter/data objects
    const filter = params.filter && Object.keys(params.filter).length > 0
      ? params.filter
      : {};
    const data = params.data && Object.keys(params.data).length > 0
      ? params.data
      : {};

    switch (operation) {
      case 'find':
        result = await col.find(filter).limit(50).toArray();
        break;

      case 'insert':
        if (Object.keys(data).length === 0) {
          throw new Error('Insert requires at least one data field');
        }
        result = await col.insertOne({
          ...data,
          createdAt: new Date()
        });
        break;

      case 'update':
        if (Object.keys(data).length === 0) {
          throw new Error('Update requires at least one data field');
        }
        result = await col.updateMany(filter, { $set: data });
        // Return readable summary
        result = {
          matchedCount:  result.matchedCount,
          modifiedCount: result.modifiedCount,
        };
        break;

      case 'delete':
        if (Object.keys(filter).length === 0) {
          throw new Error(
            'Delete without a filter would delete ALL documents. Please add a filter.'
          );
        }
        result = await col.deleteMany(filter);
        result = { deletedCount: result.deletedCount };
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    await conn.close();
  }

  return result;
}

module.exports = { testMongoConnection, runMongoQuery };