const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();

/* DB */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* TEST ROUTE */
app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

/* HOME */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* GET GRADES */
app.get("/api/grades", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM grades WHERE deleted = FALSE OR deleted IS NULL"
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "db error" });
  }
});

/* SAVE GRADE */
app.post("/api/grades", async (req, res) => {
  try {
    const { subject, grade, units } = req.body;

    await pool.query(
      "INSERT INTO grades(subject, grade, units) VALUES($1,$2,$3)",
      [subject, grade, units]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "db error" });
  }
});

/* ✅ DELETE GRADE (THIS FIXES YOUR DELETE BUTTON) */
app.delete("/api/grades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("SOFT DELETE TRIGGERED ID:", id);

    await pool.query(
      "UPDATE grades SET deleted = TRUE WHERE id = $1",
      [id]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "db error" });
  }
});

/* START */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});