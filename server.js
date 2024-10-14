const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const sensorRoutes = require('./sensor'); // import sensor routes
const accountRoutes = require('./account'); // import account routes
const path = require('path');

const PORT = 3030;

app.use(cors());
app.use(bodyParser.json());
app.use('/script', express.static(__dirname + '/script'));
app.use('/css', express.static(__dirname + '/css'));

// ใช้ router ของ sensor และ account
app.use(sensorRoutes);
app.use(accountRoutes);

// ตั้งค่าให้เสิร์ฟไฟล์ static
app.use(express.static(path.join(__dirname, 'page'))); // ระบุโฟลเดอร์ที่เก็บไฟล์ HTML

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'login.html'));
});

app.get('/page/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'register.html'));
});

app.get('/page/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'login.html'));
});

app.get('/page/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'home.html'));
});

app.get('/page/request-admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'request-admin.html'));
});

app.get('/page/respond-admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'respond-admin.html'));
});

app.get('/page/profiles.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'profiles.html'));
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
