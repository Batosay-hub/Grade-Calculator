const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

/* =========================
   TEST
========================= */
app.get("/", (req, res) => {
  res.send("Server Running");
});

/* =========================
   SAVE GRADE (NO USERNAME)
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
   GET ALL GRADES
========================= */
app.get("/api/grades", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM grades ORDER BY id DESC`
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================
   DELETE
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
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running"));