import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sensorRoutes from './sensor.js'; // import sensor routes
import accountRoutes from './account.js'; // import account routes
import path from 'path';
import { fileURLToPath } from 'url';

// กำหนดตัวแปรที่จำเป็น
const app = express();
const PORT = 3030;

// กำหนด path สำหรับ __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__filename); // แสดง path ของไฟล์ปัจจุบัน
console.log(__dirname);  // แสดง path ของโฟลเดอร์ที่ไฟล์ปัจจุบันอยู่

app.use(cors());
app.use(bodyParser.json());
app.use('/script', express.static(path.join(__dirname, 'script')));
app.use('/css', express.static(path.join(__dirname, 'css')));

// ใช้ router ของ sensor และ account
app.use(sensorRoutes);
app.use(accountRoutes);

// Middleware สำหรับให้บริการไฟล์ static
app.use(express.static(path.join(__dirname))); // <-- ตรวจสอบว่าเส้นทางนี้ถูกต้อง

// ตั้งค่าให้เสิร์ฟไฟล์ static
app.use(express.static(path.join(__dirname, 'page'))); // ระบุโฟลเดอร์ที่เก็บไฟล์ HTML

// ให้บริการ firebaseConfig.js โดยตรง
app.use('/firebaseConfig.js', express.static(path.join(__dirname, 'firebaseConfig.js')));

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
