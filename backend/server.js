const express = require('express');
const cors = require('cors');
const { query } = require('./db');  // Make sure the db.js file exists in the same folder or adjust the path
const app = express();
const port = 3000;

// Middleware to handle JSON requests
app.use(express.json());
app.use(cors());  

// Sample route to fetch data from the database
app.get('/data', async (req, res) => {
  try {
    const result = await query('SELECT * FROM public."user"');  // Adjust this SQL query as needed
    //console.log("server result",result.rows)
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
