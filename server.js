
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. MySQL Connection Logic
let pool;

const connectDB = async () => {
  if (!process.env.MYSQL_URL) {
    console.error("[CRITICAL ERROR] process.env.MYSQL_URL is missing. Railway service variables must be configured.");
    return null;
  }

  try {
    console.log("[DB] Attempting connection to MySQL using MYSQL_URL...");
    pool = mysql.createPool({
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log("[DB] ✅ Successfully connected to MySQL.");
    
    // Initialize Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contributions (
        id VARCHAR(255) PRIMARY KEY,
        contributorName VARCHAR(255) NOT NULL,
        recitationType VARCHAR(255) NOT NULL,
        count INT NOT NULL,
        timestamp BIGINT NOT NULL
      )
    `);
    console.log("[DB] ✅ Contributions table verified/created.");
    connection.release();
    return pool;
  } catch (err) {
    console.error("[DB ERROR] Failed to connect to MySQL:", err.message);
    console.error("[DB STACK]", err.stack);
    return null;
  }
};

connectDB();

// 2. API Endpoints
app.get('/api/stats', async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database not connected", detail: "Check Railway logs for MYSQL_URL errors." });
  
  try {
    const [rows] = await pool.query('SELECT recitationType, SUM(count) as total FROM contributions GROUP BY recitationType');
    const [grandTotalRow] = await pool.query('SELECT SUM(count) as total FROM contributions');
    
    const stats = { grandTotal: grandTotalRow[0]?.total || 0 };
    rows.forEach(row => {
      const key = `total_${row.recitationType.replace(/\s+/g, '_')}`;
      stats[key] = parseInt(row.total);
    });
    
    res.json(stats);
  } catch (err) {
    console.error("[API ERROR] getStats failed:", err.message);
    res.status(500).json({ error: "Database query failed", detail: err.message });
  }
});

app.get('/api/contributions', async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  
  try {
    const [rows] = await pool.query('SELECT * FROM contributions ORDER BY timestamp DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database query failed", detail: err.message });
  }
});

app.post('/api/contributions', async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  
  const { id, contributorName, recitationType, count, timestamp } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO contributions (id, contributorName, recitationType, count, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, contributorName, recitationType, count, timestamp]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("[API ERROR] postContribution failed:", err.message);
    res.status(500).json({ error: "Database insert failed", detail: err.message });
  }
});

// 3. Serve Frontend (Production Only)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`);
});
