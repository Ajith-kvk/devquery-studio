/**
 * Builds a human-readable query preview string
 * shown in the Monaco editor as the user fills fields
 */
export function buildQueryHint(dbType, collection, operation, filterField, filterValue, dataField, dataValue) {
  const col = collection || 'collection';
  const filter = filterField
    ? `{ ${filterField}: "${filterValue}" }`
    : '{}';
  const data = dataField
    ? `{ ${dataField}: "${dataValue}" }`
    : '{}';

  if (dbType === 'mongodb') {
    switch (operation) {
      case 'find':
        return `db.${col}.find(${filter})`;
      case 'insert':
        return `db.${col}.insertOne(${data})`;
      case 'update':
        return `db.${col}.updateMany(\n  ${filter},\n  { $set: ${data} }\n)`;
      case 'delete':
        return `db.${col}.deleteMany(${filter})`;
      default:
        return '';
    }
  }

  if (dbType === 'mysql') {
    switch (operation) {
      case 'find':
        return filterField
          ? `SELECT * FROM ${col}\nWHERE ${filterField} = "${filterValue}"\nLIMIT 50;`
          : `SELECT * FROM ${col} LIMIT 50;`;
      case 'insert':
        return `INSERT INTO ${col}\nSET ${dataField} = "${dataValue}";`;
      case 'update':
        return `UPDATE ${col}\nSET ${dataField} = "${dataValue}"\nWHERE ${filterField} = "${filterValue}";`;
      case 'delete':
        return `DELETE FROM ${col}\nWHERE ${filterField} = "${filterValue}";`;
      default:
        return '';
    }
  }

  return '';
}