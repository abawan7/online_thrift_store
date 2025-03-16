const express = require('express');
const cors = require('cors');
const { query } = require('./db');  
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());  
const { spawn } = require("child_process");
const path = require("path");

app.get('/data', async (req, res) => {
  try {
    const result = await query('SELECT * FROM public."users"'); 
    console.log("server result",result.rows)
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



//dummy function for extracting keywords:

app.post("/extract-keywords", (req, res) => {
  console.log('inside extract keywords of server.js')
  const { wishlistItems } = req.body;
  

  const pythonScriptPath = path.resolve(__dirname, "..", "hooks", "keyword_extraction.py");
  const pythonProcess = spawn("python", [pythonScriptPath]);

  // Send JSON data to Python script
  pythonProcess.stdin.write(JSON.stringify(wishlistItems));
  pythonProcess.stdin.end();

  let data = "";

  pythonProcess.stdout.on("data", (chunk) => {
      data += chunk.toString();
  });

  pythonProcess.stderr.on("data", (error) => {
      console.error("Error:", error.toString());
  });

  pythonProcess.stdout.on("end", () => {
      try {
          const keywords = JSON.parse(data);
          res.json({ keywords });
          console.log("extracted keywords are: ",keywords)
      } catch (error) {
          res.status(500).json({ error: "Failed to process data" });
      }
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
