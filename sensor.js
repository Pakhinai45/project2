import express from 'express';
import cors from 'cors';

const router = express.Router();

router.use(cors());
router.use(express.json());

let sensorData = {
    distance: '',
    humidity: '',
    temperature: '',
    ldr: '',
    pH: '',
    pumpState: false,
    isFlowing: false
};

// Endpoint สำหรับรับข้อมูลเซ็นเซอร์
router.post('/sensor', async (req, res) => {
    const { distance, humidity, temperature, ldr, pH, isFlowing } = req.body;

    if (distance !== undefined) sensorData.distance = distance;
    if (humidity !== undefined) sensorData.humidity = humidity;
    if (temperature !== undefined) sensorData.temperature = temperature;
    if (ldr !== undefined) sensorData.ldr = ldr;
    if (pH !== undefined) sensorData.pH = pH;
    if (isFlowing !== undefined) sensorData.isFlowing = isFlowing;

    console.log(`Distance: ${sensorData.distance} cm`);
    console.log(`Humidity: ${sensorData.humidity}%`);
    console.log(`Temperature: ${sensorData.temperature}°C`);
    console.log(`LDR: ${sensorData.ldr}`);
    console.log(`pH: ${sensorData.pH}`);
    console.log(`Pump State: ${sensorData.pumpState}`);
    console.log(`Is Flowing: ${sensorData.isFlowing}`);

    res.send('Data received');
});

// Endpoint สำหรับควบคุมปั๊มน้ำ
router.post('/togglePump', async (req, res) => {
    const { pumpState } = req.body;

    if (pumpState !== undefined) {
        sensorData.pumpState = pumpState;
        sensorData.isFlowing = pumpState ? 1 : 0;
        console.log(`Pump State updated to: ${sensorData.pumpState}`);
        console.log(`Is Flowing updated to: ${sensorData.isFlowing}`);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Endpoint สำหรับรับข้อมูลเซ็นเซอร์
router.get('/data', async (req, res) => {
    res.json(sensorData);
});

export default router; // Export router
