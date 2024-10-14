document.getElementById('toggleButton').addEventListener('click', function() {
    const button = this;
    const isOn = button.classList.contains('on');
    const newState = !isOn;

    // ส่งค่า true/false ไปยัง server
    fetch('https://project2-t1ot.onrender.com/togglePump', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pumpState: newState }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response received:", data);
        if (data.success) {
            button.textContent = newState ? 'ปิด' : 'เปิด';
            button.classList.toggle('on', newState);
            button.style.backgroundColor = newState ? '#f44336' : '#4caf50';
        } else {
            alert('การควบคุมปั๊มน้ำล้มเหลว');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });    
});

// Fetch sensor data and update water level
function fetchSensorData() {
    fetch('https://project2-t1ot.onrender.com/data')
        .then(response => response.json())
        .then(data => {
            console.log(data); // ตรวจสอบข้อมูลที่ได้รับจากเซิร์ฟเวอร์

            const distance = parseFloat(data.distance);
            const humidity = parseFloat(data.humidity);
            const temperature = parseFloat(data.temperature);
            const ldr = parseFloat(data.ldr);
            const ph = parseFloat(data.pH);
            const isFlowing = data.isFlowing;

            if (!isNaN(distance)) {
                updateWaterLevel(distance);
            } else {
                console.error('Invalid distance value:', data.distance);
            }

            if (!isNaN(humidity)) {
                document.getElementById('humidity').textContent = humidity + '%';
            } else {
                console.error('Invalid humidity value:', data.humidity);
            }

            if (!isNaN(temperature)) {
                document.getElementById('temperature').textContent = temperature + '°C';
            } else {
                console.error('Invalid temperature value:', data.temperature);
            }

            if (!isNaN(ldr)) {
                updateLightIntensity(ldr);
            } else {
                console.error('Invalid LDR value:', data.ldr);
            }
            
            if (!isNaN(ph)) {
                document.getElementById('ph').textContent = ph + '%';
            } else {
                console.error('Invalid temperature value:', data.ph);
            }

            // อัปเดตสถานะปั๊มน้ำตามค่า isFlowing
            const pumpStatusElement = document.getElementById('pumpStatus');
            const toggleButton = document.getElementById('toggleButton');

            if (isFlowing == 1) {
                pumpStatusElement.textContent = "สถานะปั๊มน้ำ: กำลังทำงาน";
                toggleButton.textContent = 'ปิด'; // เปลี่ยนปุ่มเป็น 'ปิด'
                toggleButton.classList.add('on');
                toggleButton.style.backgroundColor = '#f44336'; // สีแดง
            } else {
                pumpStatusElement.textContent = "สถานะปั๊มน้ำ: ไม่ทำงาน";
                toggleButton.textContent = 'เปิด'; // เปลี่ยนปุ่มเป็น 'เปิด'
                toggleButton.classList.remove('on');
                toggleButton.style.backgroundColor = '#4caf50'; // สีเขียว
            }

        })
        .catch(error => console.error('Error fetching sensor data:', error));
}


function updateWaterLevel(distance) {
    const maxDistance = 22; // ระยะทางสูงสุด
    const minDistance = 4; // ระยะทางต่ำสุด (ค่าที่คุณต้องการ)
    const fillPercentage = Math.max(0, Math.min(100, ((maxDistance - distance) / (maxDistance - minDistance)) * 100));
    const waterBar = document.getElementById('waterBar');

    // ปรับเปอร์เซ็นต์ความกว้างของ fill bar
    waterBar.style.width = fillPercentage + '%';
    waterBar.style.left = (100 - fillPercentage) + '%'; // เปลี่ยนตำแหน่งจากซ้ายไปขวา

    // เปลี่ยนสีของ fill bar ตามค่าเซ็นเซอร์
    if (distance <= 8) {
        waterBar.style.backgroundColor = 'skyblue'; // สีฟ้า
    } else if (distance <= 15) {
        waterBar.style.backgroundColor = 'yellow'; // สีเหลือง
    } else {
        waterBar.style.backgroundColor = 'red'; // สีแดง
    }
}

function updateLightIntensity(ldr) {
    const lightIntensityElement = document.getElementById('lightIntensity');
    let intensityText = '';
    
    if (ldr < 900) {
        intensityText = 'แดด';
    } else if (ldr < 2500) {
        intensityText = 'ร่ม';
    } else if (ldr > 3000) {
        intensityText = 'มืด';
    }
    
    lightIntensityElement.textContent = intensityText;
}


let countdownInterval; // เก็บตัวแปร interval ของการนับถอยหลัง
let onTime = 0, offTime = 0; // เก็บค่าของเวลาเปิด-ปิดที่ตั้งค่าไว้
let isCountingDown = false; // ตรวจสอบว่ากำลังนับถอยหลังอยู่หรือไม่

// ฟังก์ชันเริ่มต้นการนับถอยหลัง
function startCountdown(duration, display, callback) {
    
    let timer = duration, minutes, seconds;
    clearInterval(countdownInterval); // เคลียร์ interval ก่อนหน้านี้
    countdownInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(countdownInterval);
            callback(); // เรียก callback เมื่อเวลาหมด
        }
    }, 1000);
}

// ฟังก์ชันอัปเดตเวลาที่แสดงในหน้าเว็บ
function updateDisplayedTimes() {
    document.getElementById('onTime').textContent = document.getElementById('onTimeInput').value;
    document.getElementById('offTime').textContent = document.getElementById('offTimeInput').value;
}

// ฟังก์ชันสำหรับตรวจสอบข้อมูล
function validateTimeInput(value) {
    const num = parseInt(value, 10);
    return Number.isInteger(num) && num >= 0 && num <= 60;
}

// ตั้งเวลาเปิด-ปิดปั๊มน้ำ
document.getElementById('saveSettingsButton').addEventListener('click', function() {
    const onTimeInput = document.getElementById('onTimeInput').value;
    const offTimeInput = document.getElementById('offTimeInput').value;

    // ตรวจสอบข้อมูลที่กรอก
    if (!validateTimeInput(onTimeInput)) {
        alert("กรุณากรอกเวลาที่เปิดในช่วง 0 ถึง 60 นาที");
        return;
    }

    if (!validateTimeInput(offTimeInput)) {
        alert("กรุณากรอกเวลาที่ปิดในช่วง 0 ถึง 60 นาที");
        return;
    }

    // เปลี่ยนค่าเวลาเป็นวินาที
    onTime = parseInt(onTimeInput) * 60;
    offTime = parseInt(offTimeInput) * 60;

    // บันทึกค่าใน Local Storage
    localStorage.setItem('onTime', document.getElementById('onTimeInput').value);
    localStorage.setItem('offTime', document.getElementById('offTimeInput').value);

    // อัปเดตการแสดงผล
    updateDisplayedTimes();

    // ปิด modal
    document.getElementById('settingsModal').style.display = 'none';
});

// ฟังก์ชันที่โหลดค่าจาก Local Storage
function loadSettings() {
    const savedOnTime = localStorage.getItem('onTime');
    const savedOffTime = localStorage.getItem('offTime');

    if (savedOnTime !== null) {
        document.getElementById('onTimeInput').value = savedOnTime;
        onTime = parseInt(savedOnTime) * 60;
    }
    if (savedOffTime !== null) {
        document.getElementById('offTimeInput').value = savedOffTime;
        offTime = parseInt(savedOffTime) * 60;
    }

    // อัปเดตการแสดงผล
    updateDisplayedTimes();
}

// เรียกใช้ฟังก์ชันเมื่อหน้าเว็บโหลด
window.onload = loadSettings;


// ฟังก์ชันที่ทำงานแบบวนลูป
function loopCycle() {
    if (!isCountingDown) return; // ถ้าไม่กำลังนับถอยหลังก็ไม่ทำงาน
    
    startCountdown(onTime, document.getElementById('onTimeCountdown'), function() {
        togglePump(false); // ปิดปั๊มน้ำเมื่อเวลานับถอยหลังหมด
        startCountdown(offTime, document.getElementById('offTimeCountdown'), function() {
            togglePump(true); // เปิดปั๊มน้ำอีกครั้งหลังจากเวลาปิดนับถอยหลังหมด
            loopCycle(); // เริ่มต้นลูปใหม่
        });
    });
}

// ฟังก์ชันสำหรับเปิด/ปิดปั๊มน้ำ
function togglePump(state) {
    fetch('https://project2-t1ot.onrender.com/togglePump', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pumpState: state }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response received:", data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.getElementById('toggleButton').addEventListener('click', function() {
    const button = this;
    const isOn = button.classList.contains('on');
    const newState = !isOn;

    button.textContent = newState ? 'ปิด' : 'เปิด';
    button.classList.toggle('on', newState);
    button.style.backgroundColor = newState ? '#f44336' : '#4caf50';

    if (newState) {
        isCountingDown = true;
        document.getElementById('offTimeCountdown').textContent = "00:00"; // รีเซ็ตแสดงผลเป็น 00:00
        loopCycle(); // เริ่มนับถอยหลังใหม่เมื่อเปิดปั๊มน้ำ
    } else {
        isCountingDown = false;
        clearInterval(countdownInterval); // หยุดการนับถอยหลังเมื่อปิดปั๊มน้ำ
        document.getElementById('onTimeCountdown').textContent = "00:00"; // รีเซ็ตแสดงผลเป็น 00:00
        document.getElementById('offTimeCountdown').textContent = "00:00"; // รีเซ็ตแสดงผลเป็น 00:00
    }
});

// เปิด modal เมื่อกดปุ่มตั้งค่า
document.getElementById('settingsButton').addEventListener('click', function() {
    document.getElementById('settingsModal').style.display = 'block';
});

// ปิด modal เมื่อคลิกภายนอก
window.addEventListener('click', function(event) {
    const modal = document.getElementById('settingsModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// เรียกใช้ฟังก์ชัน fetchSensorData ทุกๆ 1 วินาที
setInterval(fetchSensorData, 1000);

