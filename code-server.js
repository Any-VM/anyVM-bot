const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3020;

//untested
app.use(express.json());


app.post('/receive-data', (req, res) => {
  const data = req.body;
  const filePath = path.join(__dirname, 'receivedData.json');

 
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Failed to write data to file:', err);
      return res.status(500).send('Failed to write data');
    }

    console.log('Data written to receivedData.json');
    res.send('Data received and written to file');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});