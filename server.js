const express = require("express");
const app = express();
const pool = require("./db");

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Debug (helps Render logs)
console.log("APP STARTING...");
console.log("PORT:", PORT);
console.log("DATABASE:", process.env.DATABASE_URL ? "CONNECTED" : "MISSING");

// Helper function
function getRemarks(g) {
  if (g <= 1.25) return "Excellent";
  if (g <= 1.75) return "Very Good";
  if (g <= 2.25) return "Good";
  if (g <= 2.75) return "Satisfactory";
  if (g <= 3.00) return "Passed";
  return "Failed";
}

// TEST ROUTE (important for checking if site is alive)
app.get("/", (req, res) => {
  res.send("Server is running successfully 🚀");
});

// GET grades
app.get("/api/grades", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM grades ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// POST grade
app.post("/api/grades", async (req, res) => {
  try {
    const { subject, grade, units } = req.body;

    const result = await pool.query(
      `INSERT INTO grades (subject, grade, units, remarks)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        subject,
        parseFloat(grade),
        parseInt(units) || 0,
        getRemarks(parseFloat(grade))
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).send("Insert failed");
  }
});

// DELETE grade
app.delete("/api/grades/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM grades WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
});

// START SERVER (VERY IMPORTANT FOR RENDER)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});