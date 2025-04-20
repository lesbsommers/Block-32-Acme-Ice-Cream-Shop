const express = require('express');
const { Client } = require('pg');

const app = express();
const port = 3000;

// Connect to Postgres
const client = new Client({
  user: 'lhern',
  password: '',
  host: 'localhost',
  port: 5432,
  database: 'lhern',
});

client.connect();
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('I want Ice Cream, now!');
});

// Get all flavors
app.get('/api/flavors', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM flavors ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single flavor by ID
app.get('/api/flavors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM flavors WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Flavor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new flavor
app.post('/api/flavors', async (req, res) => {
  const { name, description, price, popularityScore, isAvailable = true } = req.body;
  if (!name || price == null || popularityScore == null) {
    return res.status(400).json({ error: 'Missing required fields: name, price, popularityScore' });
  }

  try {
    const result = await client.query(
      `INSERT INTO flavors (name, description, price, popularityScore, isAvailable) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price, popularityScore, isAvailable]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a flavor
app.put('/api/flavors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, popularityScore, isAvailable } = req.body;

  try {
    const result = await client.query(
      `UPDATE flavors 
       SET name = $1, description = $2, price = $3, popularityScore = $4, isAvailable = $5
       WHERE id = $6 RETURNING *`,
      [name, description, price, popularityScore, isAvailable, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Flavor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a flavor
app.delete('/api/flavors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM flavors WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Flavor not found' });
    res.status(204).send(); // no content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🍦 Server is running at http://localhost:${port}`);
});
