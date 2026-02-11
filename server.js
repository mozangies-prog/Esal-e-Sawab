
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

/**
 * PORT 8080 is what your Railway dashboard shows. 
 * Defaulting to 8080 ensures it matches the internal routing.
 */
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 1. MySQL Connection
let pool;
const connectDB = async () => {
  if (!process.env.MYSQL_URL) {
    console.error("[CRITICAL] MYSQL_URL is missing. The app will run in 'Personal Mode' only.");
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
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contributions (
        id VARCHAR(255) PRIMARY KEY,
        contributorName VARCHAR(255) NOT NULL,
        recitationType VARCHAR(255) NOT NULL,
        count INT NOT NULL,
        timestamp BIGINT NOT NULL
      )
    `);
    connection.release();
  } catch (err) {
    console.error("[DB ERROR]", err.message);
  }
};
connectDB();

// 2. API Endpoints
app.get('/api/health', (req, res) => res.json({ status: 'ok', port: PORT }));

app.get('/api/stats', async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  try {
    const [rows] = await pool.query('SELECT recitationType, SUM(count) as total FROM contributions GROUP BY recitationType');
    const [grandTotalRow] = await pool.query('SELECT SUM(count) as total FROM contributions');
    const stats = { grandTotal: parseInt(grandTotalRow[0]?.total || 0) };
    rows.forEach(row => {
      stats[`total_${row.recitationType.replace(/\s+/g, '_')}`] = parseInt(row.total);
    });
    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/contributions', async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  try {
    const [rows] = await pool.query('SELECT * FROM contributions ORDER BY timestamp DESC LIMIT 50');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contributions', async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  const { id, contributorName, recitationType, count, timestamp } = req.body;
  try {
    await pool.query('INSERT INTO contributions VALUES (?, ?, ?, ?, ?)', [id, contributorName, recitationType, count, timestamp]);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Static Asset Serving
// Pointing to 'dist' which is the default Vite build output
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] 🚀 Application live at 0.0.0.0:${PORT}`);
});
