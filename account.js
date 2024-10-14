const { getDatabase, set, ref, get, child, remove, update } = require("firebase/database"); // เพิ่ม get และ child
const { initializeApp } = require("firebase/app");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const bcrypt = require('bcrypt');
const { sendPasswordResetEmail } = require('firebase/auth');
const admin = require('firebase-admin');

const router = express.Router(); 

// Firebase Admin SDK initialization
const serviceAccount = require('./root/aeroponics-e15b0-firebase-adminsdk-xtym6-d539ca4798.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://aeroponics-e15b0-default-rtdb.asia-southeast1.firebasedatabase.app/'
});

const firebaseConfig = {
    apiKey: "AIzaSyAHb7c71eD80O8pF-l3JFqXiNaqMZb6xDI",
    authDomain: "aeroponics-e15b0.firebaseapp.com",
    databaseURL: "https://aeroponics-e15b0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aeroponics-e15b0",
    storageBucket: "aeroponics-e15b0.appspot.com",
    messagingSenderId: "810278392432",
    appId: "1:810278392432:web:a91e7c0b98f5dc5b855ab5",
    measurementId: "G-DK4EM20L5M"
  };

router.use(cors());
router.use(bodyParser.json());

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Register user
router.post('/api/register', async (req, res) => {
    const { fname,lname, phon, email, password, confirmPassword } = req.body;
  
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "รหัสผ่านไม่ตรงกัน!!!" });
    }
  
    try {
      const auth = getAuth();
  
      // สร้างบัญชี Firebase Authentication โดยใช้ email และ password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid; // ดึง userId (UID) ของผู้ใช้จาก Firebase Authentication

      // บันทึกข้อมูลผู้ใช้ลงใน Firebase Realtime Database
      await set(ref(db, 'users/' + userId), {
        userId: userId,       // บันทึก userId ลงในฐานข้อมูล
        fname: fname,          // บันทึก username
        lname:lname,
        phon: phon,           // บันทึกหมายเลขโทรศัพท์
        email: email,           // บันทึกอีเมล   
        status: 0,            // สถานะของผู้ใช้
        tokenline: "null",    // ค่าเริ่มต้นของ tokenline
        popupadmin:false,
        createdAt: new Date().toString() // วันเวลาที่สร้างบัญชี
      });
  
      return res.status(201).json({ message: 'สร้างบัญชีสำเร็จ' });
  
    } catch (error) {
      console.error('Error saving data:', error);
      return res.status(500).json({ message: error.message });
    }
  });

  // Request password reset
router.post('/api/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        const auth = getAuth();

        // ส่งอีเมลเพื่อรีเซ็ตรหัสผ่าน
        await sendPasswordResetEmail(auth, email);
        return res.status(200).json({ message: 'อีเมลรีเซ็ตรหัสผ่านถูกส่งไปยัง ' + email });

    } catch (error) {
        console.error('Error sending password reset email:', error);
        return res.status(500).json({ message: error.message });
    }
});

// Login user
router.post('/verify-token', async (req, res) => {
    const { token } = req.body;
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log(decodedToken); // เพิ่มการแสดงผลเพื่อดีบั๊ก
      
      const uid = decodedToken.uid;
      const emailVerified = decodedToken.email_verified;

       // ดึงข้อมูล status จาก Firebase Realtime Database
       const userRef = admin.database().ref(`/users/${uid}/status`);
       const statusSnapshot = await userRef.once('value');
       const statusValue = statusSnapshot.val();

       if (statusValue !== null) {
        // ส่งค่า uid, status และหน้า page กลับไปที่ client
        return res.status(200).json({ 
            message: 'Login successful', 
            uid: uid, 
            status: statusValue, 
            page: 'home.html' 
        });
        } else {
            return res.status(400).json({ message: 'Status not found' });
        }
  
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
});

// API สำหรับดึงค่า status ของผู้ใช้
router.get('/api/users/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const dbRef = ref(db, `users/${uid}`);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            const uid = userData.userId;
            const fname = userData.fname;
            const lname = userData.lname;
            const email = userData.email;
            const status = userData.status;
            const tokenline = userData.tokenline;
            const popupadmin = userData.popupadmin;
            return res.status(200).json({ fname, lname,status,email,tokenline,popupadmin,uid});
        } else {
            return res.status(404).json({ message: 'ไม่พบข้อมูลสถานะของผู้ใช้' });
        }
    } catch (error) {
        console.error('Error fetching user status:', error);
        return res.status(500).json({ message: error.message });
    }
});

//editUser
router.put('/api/editusers/:uid', async (req, res) => {
    const uid = req.params.uid;
    const updatedUserData = req.body; // ข้อมูลใหม่ที่ส่งมา

    try {
        const dbRef = ref(db, `users/${uid}`);
        const requestSnapshot = await get(dbRef);

        if (requestSnapshot.exists()) {
            // อัปเดตข้อมูลผู้ใช้ในฐานข้อมูล
            await update(dbRef, updatedUserData);

            return res.status(200).json({ message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ' });
        } else {
            console.error(`ไม่พบผู้ใช้ที่ UID: ${uid}`); // เพิ่มการล็อกเพื่อช่วยในการดีบัก
            return res.status(404).json({ message: `ไม่พบผู้ใช้ที่ UID: ${uid}` });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: error.message });
    }
});



// สร้างคำขอเป็น Admin
router.post('/api/request-admin', async (req, res) => {
    const { uid, note } = req.body; // เพิ่ม note เพื่อดึงข้อมูลหมายเหตุ
  
    try {
        const dbRef = ref(db);
        const userSnapshot = await get(child(dbRef, `users/${uid}`));
  
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            const { fname, lname, status } = userData; // ดึงค่า fname, lname, และ status

            if (userData.status === 0) {
                // บันทึกคำขอลงในฐานข้อมูล
                //const requestId = `request_${Date.now()}`; // สร้าง ID สำหรับคำขอ

                // บันทึกคำขอพร้อม fname, lname และ status ของผู้ใช้ลงในฐานข้อมูล
                await set(ref(db, `requests/${uid}`), {
                    uid: uid,
                    fname: fname,    // เก็บ fname ในคำขอ
                    lname: lname,    // เก็บ lname ในคำขอ
                    status: status,  // ส่งค่า status ของผู้ใช้
                    timestamp: new Date().toISOString(),
                    note: note       // บันทึกหมายเหตุในฐานข้อมูล
                });
  
                return res.status(200).json({ message: 'คำขอส่งเรียบร้อยแล้ว' });
            } else {
                return res.status(403).json({ message: 'คุณไม่สามารถส่งคำขอนี้ได้' });
            }
        } else {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' });
        }
    } catch (error) {
        console.error('Error sending request:', error);
        return res.status(500).json({ message: error.message });
    }
  });


// สร้าง API ที่ดึงคำขอทั้งหมดตาม username
router.get('/api/requests/:uid', async (req, res) => {
  const { uid } = req.params; // ดึง username จากพารามิเตอร์
  console.log(uid);

  try {
      const dbRef = ref(db);
      const requestsSnapshot = await get(child(dbRef, `requests`));
      const requests = [];

      if (requestsSnapshot.exists()) {
          const requestsData = requestsSnapshot.val();
          // กรองคำขอที่เป็นของผู้ใช้ตาม uid
          for (const requestKey in requestsData) {
            const request = requestsData[requestKey]; // ข้อมูลคำขอ
              if (request.uid === uid) {
                  requests.push({
                      ...request // แสดงข้อมูลทั้งหมดของคำขอ
                  });
              }
          }
      }

      if (requests.length > 0) {
          return res.status(200).json(requests); // ส่งกลับข้อมูลคำขอที่กรองแล้ว
      } else {
          return res.status(404).json({ message: 'ไม่พบคำขอสำหรับผู้ใช้นี้' }); // กรณีไม่มีคำขอ
      }
  } catch (error) {
      console.error('Error fetching requests:', error);
      return res.status(500).json({ message: error.message });
  }
});


// ดึงคำขอทั้งหมด (ไม่กรองตาม username)
router.get('/api/requests', async (req, res) => {
    try {
        const dbRef = ref(db);
        const requestsSnapshot = await get(child(dbRef, 'requests')); // ดึงข้อมูลทั้งหมดใน requests
        const requests = [];
  
        if (requestsSnapshot.exists()) {
            const requestsData = requestsSnapshot.val();
            // เก็บคำขอทั้งหมด
            for (const uid in requestsData) {
                requests.push({
                    ...requestsData[uid] // แสดงข้อมูลทั้งหมดของคำขอ
                });
            }
        }
  
        if (requests.length > 0) {
            return res.status(200).json(requests); // ส่งกลับข้อมูลคำขอทั้งหมด
        } else {
            return res.status(404).json({ message: 'ไม่พบคำขอใดๆ' }); // กรณีไม่มีคำขอ
        }
    } catch (error) {
        console.error('Error fetching all requests:', error);
        return res.status(500).json({ message: error.message });
    }
  });
  


// อนุมัติคำขอเป็นผู้ดูแล
router.put('/api/requests/approve/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const dbRef = ref(db, `requests/${uid}`);
        const requestSnapshot = await get(dbRef);

        if (requestSnapshot.exists()) {
            // อัปเดตสถานะคำขอ
            await update(dbRef, { status: 1 });

            // อัปเดตสถานะผู้ใช้เป็น Admin
            const requestData = requestSnapshot.val();
            const userRef = ref(db, `users/${requestData.uid}`);
            await update(userRef, { status: 1 }); // เปลี่ยนสถานะเป็น Admin

            return res.status(200).json({ message: 'อนุมัติคำขอเรียบร้อยแล้ว' });
        } else {
            return res.status(404).json({ message: 'ไม่พบคำขอ' });
        }
    } catch (error) {
        console.error('Error approving request:', error);
        return res.status(500).json({ message: error.message });
    }
});

// ลบคำขอ
router.delete('/api/requests/delete/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const dbRef = ref(db, `requests/${uid}`);
        const requestSnapshot = await get(dbRef);

        if (requestSnapshot.exists()) {
            // ลบคำขอออกจากฐานข้อมูล
            await remove(dbRef);
            return res.status(200).json({ message: 'ลบคำขอเรียบร้อยแล้ว' });
        } else {
            return res.status(404).json({ message: 'ไม่พบคำขอ' });
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        return res.status(500).json({ message: error.message });
    }
});

// update Popupadmin
router.put('/api/users/update/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const dbRef = ref(db, `users/${uid}`);
        const requestSnapshot = await get(dbRef);

        if (requestSnapshot.exists()) {
            // อัปเดตสถานะคำขอ
            await update(dbRef, { popupadmin: true });

            return res.status(200).json({ message: 'อนุมัติคำขอเรียบร้อยแล้ว' });
        } else {
            return res.status(404).json({ message: 'ไม่พบคำขอ' });
        }
    } catch (error) {
        console.error('Error approving request:', error);
        return res.status(500).json({ message: error.message });
    }
});

// สร้าง API เพื่อตรวจสอบ UID และอัปเดต tokenline โดยไม่เช็คค่าเดิม
router.post('/api/update-tokenline', async (req, res) => {
    const { uid, tokenline } = req.body; // รับค่า uid และ tokenline จาก request body

    try {
        const dbRef = ref(db);
        const userSnapshot = await get(child(dbRef, `users/${uid}`)); // ดึงข้อมูลผู้ใช้ตาม uid ที่รับมา

        if (userSnapshot.exists()) {

            // อัปเดตค่า tokenline ในฐานข้อมูลทันที
            await update(ref(db, `users/${uid}`), { tokenline });

            return res.status(200).json({
                message: `อัปเดต tokenline สำเร็จ`,
            });
        } else {
            return res.status(404).json({
                message: 'ไม่พบผู้ใช้ตาม UID นี้',
            });
        }
    } catch (error) {
        console.error('Error updating tokenline:', error);
        return res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการอัปเดต tokenline',
        });
    }
});



module.exports = router;
