/**
 * Generates a complete Express.js route file as a string
 * @param {string} collection - e.g. "users"
 * @param {string} dbType - "mongodb" or "mysql"
 * @param {string[]} operations - e.g. ["getAll", "getById", "create", "update", "delete"]
 */
function generateRoute(collection, dbType, operations) {
  const modelName = collection.charAt(0).toUpperCase() + collection.slice(1);
  const lines = [];

  if (dbType === 'mongodb') {
    lines.push(`const express = require('express');`);
    lines.push(`const router = express.Router();`);
    lines.push(`const ${modelName} = require('../models/${modelName}');`);
    lines.push(``);
    lines.push(`// ── ${modelName} Routes ──────────────────────────────────`);
    lines.push(``);

    if (operations.includes('getAll')) {
      lines.push(`// GET all ${collection}`);
      lines.push(`router.get('/', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const ${collection} = await ${modelName}.find();`);
      lines.push(`    res.json(${collection});`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(500).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    if (operations.includes('getById')) {
      lines.push(`// GET ${collection} by ID`);
      lines.push(`router.get('/:id', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const item = await ${modelName}.findById(req.params.id);`);
      lines.push(`    if (!item) return res.status(404).json({ message: 'Not found' });`);
      lines.push(`    res.json(item);`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(500).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    if (operations.includes('create')) {
      lines.push(`// POST create ${collection}`);
      lines.push(`router.post('/', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const item = new ${modelName}(req.body);`);
      lines.push(`    const saved = await item.save();`);
      lines.push(`    res.status(201).json(saved);`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(400).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    if (operations.includes('update')) {
      lines.push(`// PUT update ${collection} by ID`);
      lines.push(`router.put('/:id', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const updated = await ${modelName}.findByIdAndUpdate(`);
      lines.push(`      req.params.id,`);
      lines.push(`      req.body,`);
      lines.push(`      { new: true }`);
      lines.push(`    );`);
      lines.push(`    if (!updated) return res.status(404).json({ message: 'Not found' });`);
      lines.push(`    res.json(updated);`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(400).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    if (operations.includes('delete')) {
      lines.push(`// DELETE ${collection} by ID`);
      lines.push(`router.delete('/:id', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const deleted = await ${modelName}.findByIdAndDelete(req.params.id);`);
      lines.push(`    if (!deleted) return res.status(404).json({ message: 'Not found' });`);
      lines.push(`    res.json({ message: '${modelName} deleted successfully' });`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(500).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    lines.push(`module.exports = router;`);
  }

  if (dbType === 'mysql') {
    lines.push(`const express = require('express');`);
    lines.push(`const router = express.Router();`);
    lines.push(`const db = require('../utils/db'); // your mysql2 pool`);
    lines.push(``);
    lines.push(`// ── ${modelName} Routes ──────────────────────────────────`);
    lines.push(``);

    if (operations.includes('getAll')) {
      lines.push(`// GET all ${collection}`);
      lines.push(`router.get('/', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const [rows] = await db.query('SELECT * FROM ${collection}');`);
      lines.push(`    res.json(rows);`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(500).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    if (operations.includes('getById')) {
      lines.push(`// GET ${collection} by ID`);
      lines.push(`router.get('/:id', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const [rows] = await db.query(`);
      lines.push(`      'SELECT * FROM ${collection} WHERE id = ?',`);
      lines.push(`      [req.params.id]`);
      lines.push(`    );`);
      lines.push(`    if (!rows.length) return res.status(404).json({ message: 'Not found' });`);
      lines.push(`    res.json(rows[0]);`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(500).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    if (operations.includes('create')) {
      lines.push(`// POST create ${collection}`);
      lines.push(`router.post('/', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const [result] = await db.query(`);
      lines.push(`      'INSERT INTO ${collection} SET ?',`);
      lines.push(`      [req.body]`);
      lines.push(`    );`);
      lines.push(`    res.status(201).json({ id: result.insertId, ...req.body });`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(400).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    if (operations.includes('update')) {
      lines.push(`// PUT update ${collection} by ID`);
      lines.push(`router.put('/:id', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const [result] = await db.query(`);
      lines.push(`      'UPDATE ${collection} SET ? WHERE id = ?',`);
      lines.push(`      [req.body, req.params.id]`);
      lines.push(`    );`);
      lines.push(`    if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });`);
      lines.push(`    res.json({ id: req.params.id, ...req.body });`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(400).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    if (operations.includes('delete')) {
      lines.push(`// DELETE ${collection} by ID`);
      lines.push(`router.delete('/:id', async (req, res) => {`);
      lines.push(`  try {`);
      lines.push(`    const [result] = await db.query(`);
      lines.push(`      'DELETE FROM ${collection} WHERE id = ?',`);
      lines.push(`      [req.params.id]`);
      lines.push(`    );`);
      lines.push(`    if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });`);
      lines.push(`    res.json({ message: 'Deleted successfully' });`);
      lines.push(`  } catch (err) {`);
      lines.push(`    res.status(500).json({ message: err.message });`);
      lines.push(`  }`);
      lines.push(`});`);
      lines.push(``);
    }

    lines.push(`module.exports = router;`);
  }

  return lines.join('\n');
}

module.exports = { generateRoute };