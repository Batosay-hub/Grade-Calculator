const express = require('express');
const app = express();
const pool = require('./db');

const PORT = 3001;

app.use(express.json());
app.use(express.static(__dirname));

console.log("SERVER RUNNING");

pool.connect()
  .then(() => console.log("POSTGRES CONNECTED"))
  .catch(err => console.error(err));

function getRemarks(g) {
  if (g <= 1.25) return "Excellent";
  if (g <= 1.75) return "Very Good";
  if (g <= 2.25) return "Good";
  if (g <= 2.75) return "Satisfactory";
  if (g <= 3.00) return "Passed";
  return "Failed";
}

/* GET */
app.get('/api/grades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grades ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* POST */
app.post('/api/grades', async (req, res) => {

  console.log("BODY RECEIVED:", req.body);

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

    console.log("INSERTED:", result.rows[0]);

    res.json(result.rows[0]);

  } catch (err) {

    console.error("POST ERROR:", err);

    res.status(500).send(err.message);

  }
});
/* DELETE */
app.delete('/api/grades/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM grades WHERE id = $1', [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log("http://localhost:" + PORT);
});