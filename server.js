const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();

/* =========================
   DATABASE CONNECTION
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* =========================
   FORCE DATABASE CHECK (DEBUG)
========================= */
pool.connect()
  .then(() => console.log("DATABASE CONNECTED"))
  .catch(err => console.log("DB ERROR:", err));

/* =========================
   CREATE TABLE SAFELY
========================= */
pool.query(`
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  subject TEXT,
  grade NUMERIC,
  units INT
);
`);

/* =========================
   HOME → LOAD WEBSITE
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   TEST API (IMPORTANT FOR DEBUGGING)
========================= */
app.get("/api/test", (req, res) => {
  res.json({ status: "API WORKING" });
});

/* =========================
   SAVE GRADE
========================= */
app.post("/api/grades", async (req, res) => {
  try {
    const { subject, grade, units } = req.body;

    if (!subject || grade == null || units == null) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await pool.query(
      `INSERT INTO grades (subject, grade, units)
       VALUES ($1, $2, $3)`,
      [subject, grade, units]
    );

    res.json({ success: true });

  } catch (err) {
    console.log("SAVE ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================
   GET GRADES (THIS FIXES YOUR 404 ISSUE)
========================= */
app.get("/api/grades", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM grades ORDER BY id DESC`
    );

    res.json(result.rows);

  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================
   DELETE GRADE
========================= */
app.delete("/api/grades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM grades WHERE id=$1`,
      [id]
    );

    res.json({ success: true });

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});