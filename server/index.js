const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile('public/index.html');
});

app.post('/start-alarm', (req, res) => {
  console.log(req.body);
  const data = JSON.stringify(req.body);
  fs.writeFile('alarm.json', data, 'utf8', () => console.log('wrote'));

  res.send();
});

app.listen(PORT, () => {
  console.log('listening on port ' + PORT);
});
