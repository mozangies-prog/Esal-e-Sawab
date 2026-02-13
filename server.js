
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

let pool;

const connectDB = async () => {
  if (!process.env.MYSQL_URL) {
    console.error("[CRITICAL] MYSQL_URL is missing.");
    return null;
  }
  try {
    pool = mysql.createPool({
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true
    });
    const connection = await pool.getConnection();
    console.log("[DB] ✅ Connection Successful.");
    
    // Create tables if they don't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS descents (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS contributions (
        id VARCHAR(255) PRIMARY KEY,
        contributorName VARCHAR(255) NOT NULL,
        recitationType VARCHAR(255) NOT NULL,
        count INT NOT NULL,
        timestamp BIGINT NOT NULL
      )
    `);

    // --- AUTOMATIC MIGRATIONS ---
    // Safely add columns if they are missing
    try {
      const [columns] = await connection.query('SHOW COLUMNS FROM descents LIKE "passedDate"');
      if (Array.isArray(columns) && columns.length === 0) {
        await connection.query('ALTER TABLE descents ADD COLUMN passedDate VARCHAR(255)');
      }
    } catch (e) {}

    try {
      const [columns] = await connection.query('SHOW COLUMNS FROM contributions LIKE "family_id"');
      if (Array.isArray(columns) && columns.length === 0) {
        await connection.query('ALTER TABLE contributions ADD COLUMN family_id VARCHAR(255) NOT NULL AFTER id');
        await connection.query('CREATE INDEX idx_family ON contributions(family_id)');
      }
    } catch (e) {}

    // DATA RESET LOGIC REMOVED: Your data is now safe and persistent.

    connection.release();
  } catch (err) {
    console.error("[DB ERROR]", err.message);
  }
};
connectDB();

// Descents (Family) Endpoints
app.get('/api/descents/search', async (req, res) => {
  const query = req.query.q || '';
  if (!pool) return res.status(503).json({ error: "DB not connected" });
  try {
    const [rows] = await pool.query(
      'SELECT * FROM descents WHERE name LIKE ? OR location LIKE ? LIMIT 10',
      [`%${query}%`, `%${query}%`]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/descents', async (req, res) => {
  const { name, location, passedDate } = req.body;
  const id = uuidv4();
  if (!pool) return res.status(503).json({ error: "DB not connected" });
  try {
    await pool.query('INSERT INTO descents (id, name, location, passedDate) VALUES (?, ?, ?, ?)', [id, name, location, passedDate]);
    res.json({ id, name, location, passedDate });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Stats for specific family
app.get('/api/stats/:familyId', async (req, res) => {
  const { familyId } = req.params;
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  try {
    const [rows] = await pool.query(
      'SELECT recitationType, SUM(count) as total FROM contributions WHERE family_id = ? GROUP BY recitationType',
      [familyId]
    );
    const [grandTotalRow] = await pool.query(
      'SELECT SUM(count) as total FROM contributions WHERE family_id = ?',
      [familyId]
    );
    const stats = { grandTotal: parseInt(grandTotalRow[0]?.total || 0) };
    rows.forEach(row => {
      stats[`total_${row.recitationType.replace(/\s+/g, '_')}`] = parseInt(row.total);
    });
    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/contributions/:familyId', async (req, res) => {
  const { familyId } = req.params;
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  try {
    const [rows] = await pool.query(
      'SELECT * FROM contributions WHERE family_id = ? ORDER BY timestamp DESC LIMIT 100',
      [familyId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contributions', async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  const { id, family_id, contributorName, recitationType, count, timestamp } = req.body;
  try {
    await pool.query(
      'INSERT INTO contributions (id, family_id, contributorName, recitationType, count, timestamp) VALUES (?, ?, ?, ?, ?, ?)', 
      [id, family_id, contributorName, recitationType, count, timestamp]
    );
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] 🚀 Family Collective Sync enabled at 0.0.0.0:${PORT}`);
});
