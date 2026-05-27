const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();

/* =========================
   DATABASE
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
   CREATE TABLE (SAFE)
========================= */
pool.query(`
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  subject TEXT,
  grade NUMERIC,
  units INT,
  is_deleted BOOLEAN DEFAULT FALSE
);
`);

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   GET GRADES (ONLY ACTIVE)
========================= */
app.get("/api/grades", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM grades WHERE is_deleted = FALSE ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================
   SAVE GRADE
========================= */
app.post("/api/grades", async (req, res) => {
  try {
    const { subject, grade, units } = req.body;

    await pool.query(
      `INSERT INTO grades (subject, grade, units)
       VALUES ($1, $2, $3)`,
      [subject, grade, units]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================
   SOFT DELETE
========================= */
app.delete("/api/grades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE grades SET is_deleted = TRUE WHERE id=$1",
      [id]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
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