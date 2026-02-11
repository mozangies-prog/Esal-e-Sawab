
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Railway provides the port via environment variable. 
// Default to 3000 only for local testing.
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. MySQL Connection Logic
let pool;

const connectDB = async () => {
  if (!process.env.MYSQL_URL) {
    console.error("[CRITICAL] process.env.MYSQL_URL is missing. Please add it to Railway Variables.");
    return null;
  }

  try {
    console.log("[DB] Connecting to MySQL...");
    pool = mysql.createPool({
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    const connection = await pool.getConnection();
    console.log("[DB] ✅ Connection Established.");
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contributions (
        id VARCHAR(255) PRIMARY KEY,
        contributorName VARCHAR(255) NOT NULL,
        recitationType VARCHAR(255) NOT NULL,
        count INT NOT NULL,
        timestamp BIGINT NOT NULL
      )
    `);
    console.log("[DB] ✅ Table Verified.");
    connection.release();
    return pool;
  } catch (err) {
    console.error("[DB ERROR] Connection failed:", err.message);
    return null;
  }
};

connectDB();

// 2. API Endpoints
// Health check for Railway to verify the service is up
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: pool ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/stats', async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  
  try {
    const [rows] = await pool.query('SELECT recitationType, SUM(count) as total FROM contributions GROUP BY recitationType');
    const [grandTotalRow] = await pool.query('SELECT SUM(count) as total FROM contributions');
    
    const stats = { grandTotal: parseInt(grandTotalRow[0]?.total || 0) };
    rows.forEach(row => {
      const key = `total_${row.recitationType.replace(/\s+/g, '_')}`;
      stats[key] = parseInt(row.total);
    });
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Query failed", detail: err.message });
  }
});

app.get('/api/contributions', async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database not connected" });
  
  try {
    const [rows] = await pool.query('SELECT * FROM contributions ORDER BY timestamp DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Query failed", detail: err.message });
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
    res.status(500).json({ error: "Insert failed", detail: err.message });
  }
});

// 3. Serve Frontend Assets
// Ensure we serve files from the 'dist' directory created by Vite
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback: Handle SPA routing by serving index.html for all non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// IMPORTANT: Listen on '0.0.0.0' to allow Railway to expose the service to the internet
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] 🚀 Publicly accessible on port ${PORT}`);
  console.log(`[SERVER] Serving static files from: ${distPath}`);
});
