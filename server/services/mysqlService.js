const mysql = require('mysql2/promise');

// Test a MySQL connection and return all table names
async function testMysqlConnection(credentials) {
  const { host, port, user, password, database } = credentials;

  const conn = await mysql.createConnection({
    host,
    port: port || 3306,
    user,
    password,
    database
  });

  // SHOW TABLES returns rows like { Tables_in_mydb: 'users' }
  const [rows] = await conn.query('SHOW TABLES');
  await conn.end();

  return rows.map((r) => Object.values(r)[0]);
}

// Run a query on a user's MySQL database
async function runMysqlQuery(credentials, table, operation, params = {}) {
  const { host, port, user, password, database } = credentials;

  const conn = await mysql.createConnection({
    host,
    port: port || 3306,
    user,
    password,
    database
  });

  let result;

  try {
    switch (operation) {
      case 'find':
        [result] = await conn.query(
          'SELECT * FROM ?? LIMIT 50',
          [table]
        );
        break;
      case 'insert':
        [result] = await conn.query(
          'INSERT INTO ?? SET ?',
          [table, params.data || {}]
        );
        break;
      case 'update':
        [result] = await conn.query(
          'UPDATE ?? SET ? WHERE ?',
          [table, params.data || {}, params.filter || {}]
        );
        break;
      case 'delete':
        [result] = await conn.query(
          'DELETE FROM ?? WHERE ?',
          [table, params.filter || {}]
        );
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