const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sensorRoutes = require('./sensor'); // import sensor routes
const accountRoutes = require('./account'); // import account routes

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/script', express.static(__dirname + '/script'));
app.use('/css', express.static(__dirname + '/css'));

// ใช้ router ของ sensor และ account
app.use(sensorRoutes);
app.use(accountRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
