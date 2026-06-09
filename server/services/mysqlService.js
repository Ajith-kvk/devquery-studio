const mysql = require('mysql2/promise');

async function testMysqlConnection(credentials) {
  const { host, port, user, password, database } = credentials;
  const conn = await mysql.createConnection({
    host, port: port || 3306, user, password, database
  });
  const [rows] = await conn.query('SHOW TABLES');
  await conn.end();
  return rows.map((r) => Object.values(r)[0]);
}

async function runMysqlQuery(credentials, table, operation, params = {}) {
  const { host, port, user, password, database } = credentials;
  const conn = await mysql.createConnection({
    host, port: port || 3306, user, password, database
  });

  const filter = params.filter && Object.keys(params.filter).length > 0
    ? params.filter
    : null;
  const data = params.data && Object.keys(params.data).length > 0
    ? params.data
    : null;

  let result;

  try {
    switch (operation) {
      case 'find':
        if (filter) {
          const key = Object.keys(filter)[0];
          const val = Object.values(filter)[0];
          [result] = await conn.query(
            'SELECT * FROM ?? WHERE ?? = ? LIMIT 50',
            [table, key, val]
          );
        } else {
          [result] = await conn.query('SELECT * FROM ?? LIMIT 50', [table]);
        }
        break;

      case 'insert':
        if (!data) throw new Error('Insert requires at least one data field');
        [result] = await conn.query('INSERT INTO ?? SET ?', [table, data]);
        result = { insertId: result.insertId, affectedRows: result.affectedRows };
        break;

      case 'update':
        if (!data)   throw new Error('Update requires at least one data field');
        if (!filter) throw new Error('Update requires a filter to target rows');
        const updateKey = Object.keys(filter)[0];
        const updateVal = Object.values(filter)[0];
        [result] = await conn.query(
          'UPDATE ?? SET ? WHERE ?? = ?',
          [table, data, updateKey, updateVal]
        );
        result = { affectedRows: result.affectedRows, changedRows: result.changedRows };
        break;

      case 'delete':
        if (!filter) throw new Error(
          'Delete without a filter would delete ALL rows. Please add a filter.'
        );
        const deleteKey = Object.keys(filter)[0];
        const deleteVal = Object.values(filter)[0];
        [result] = await conn.query(
          'DELETE FROM ?? WHERE ?? = ?',
          [table, deleteKey, deleteVal]
        );
        result = { affectedRows: result.affectedRows };
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    await conn.end();
  }

  return result;
}

module.exports = { testMysqlConnection, runMysqlQuery };