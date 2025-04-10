require('dotenv').config({ path: './server.env' });
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    console.error('❌ JWT_SECRET is not defined in .env file');
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// 📁 Directory for uploads
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 📁 Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📦 Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// ✅ MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: '102'
});

connection.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err);
    } else {
        console.log('✅ Connected to MySQL');
        console.log(`Database: ${connection.config.database}`);
        console.log(`Host: ${connection.config.host}`);
        console.log(`User: ${connection.config.user}`);
    }
});

// 🔐 Middleware: ตรวจสอบ JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // เอา token จาก Authorization header
    if (!token) return res.status(401).json({ error: 'Access token missing' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.userId = user.user_id;  // เก็บข้อมูล user_id จาก token
        req.user = user;  // เก็บข้อมูลผู้ใช้จาก token
        next();
    });
}


  

// 🔓 Login Endpoint
// 🔓 Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM user WHERE username = ?';

    connection.query(sql, [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];  // กำหนดค่าตัวแปร user ที่นี่

        console.log('User found:', user);  // <-- แสดงผลการค้นหาผู้ใช้

        const isMatch = await bcrypt.compare(password, user.password);

        console.log('Password comparison result:', isMatch);  // <-- แสดงผลการเปรียบเทียบรหัสผ่าน

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // สร้าง JWT token
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role },
            secretKey,
            { expiresIn: '24h' }
        );

        // ส่ง token และข้อมูลผู้ใช้กลับ
        res.json({ token, user });
    });
});

const password = '12345';

bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hashedPassword);
  }
});

const plain = '123456';
const hash = '$2a$10$skPVhCghQ2zq4GoYgEdvQOvWjdnXcXnZVEiYbfW7Hz2qVi0FMuRxO';

bcrypt.compare(plain, hash).then(result => console.log(result));  // true = ตรง



// 🧪 Health Check
app.get('/api/health', (req, res) => {
    connection.ping(err => {
        if (err) {
            return res.status(500).json({ status: 'error', db: false });
        }
        res.json({ status: 'ok', db: true });
    });
});


// 📄 ดึงผู้ใช้ทั้งหมด
app.get('/api/users',(req, res) => {
    const sql = 'SELECT user_id, username, firstname, lastname, email, role, department_id FROM user';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// 📄 ดึงผู้ใช้ตาม ID
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT user_id, username, firstname, lastname, email, role, department_id FROM user WHERE user_id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results[0]);
    });
});

// ➕ สร้างผู้ใช้
app.post('/api/users', async (req, res) => {
    const users = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];

    for (const user of users) {
        const { username, password, firstname, lastname, email, role, department_id } = user;

        try {
            const hash = await bcrypt.hash(password, 10);
            const sql = 'INSERT INTO user (username, password, firstname, lastname, email, role, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [username, hash, firstname, lastname, email, role, department_id];

            await new Promise((resolve, reject) => {
                connection.query(sql, values, (err, result) => {
                    if (err) {
                        results.push({ username, success: false, error: err.message });
                        return reject(err);
                    }
                    results.push({ username, success: true, user_id: result.insertId });
                    resolve();
                });
            });

        } catch (error) {
            results.push({ username, success: false, error: error.message });
        }
    }

    res.json({ message: 'Batch user creation complete', results });
});


// 📝 แก้ไขผู้ใช้
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, firstname, lastname, email, role, department_id } = req.body;

    let fields = [];
    let values = [];

    if (username) { fields.push('username = ?'); values.push(username); }
    if (password) {
        const hash = await bcrypt.hash(password, 10);
        fields.push('password = ?');
        values.push(hash);
    }
    if (firstname) { fields.push('firstname = ?'); values.push(firstname); }
    if (lastname) { fields.push('lastname = ?'); values.push(lastname); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (role) { fields.push('role = ?'); values.push(role); }
    if (department_id) { fields.push('department_id = ?'); values.push(department_id); }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    const sql = `UPDATE user SET ${fields.join(', ')} WHERE user_id = ?`;
    values.push(id);

    connection.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Update failed', details: err });
        res.json({ message: 'User updated' });
    });
});

// ❌ ลบผู้ใช้
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM user WHERE user_id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Delete failed', details: err });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted' });
    });
});


app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // ตรวจสอบว่ามีอีเมลในระบบ
        const [user] = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // ตรวจสอบความยาวของรหัสผ่านใหม่
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password should be at least 6 characters long' });
        }

        // แฮชรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // อัปเดตรหัสผ่านในฐานข้อมูล
        await new Promise((resolve, reject) => {
            connection.query('UPDATE user SET password = ? WHERE email = ?', [hashedPassword, email], (err, updateResults) => {
                if (err) reject(err);
                resolve(updateResults);
            });
        });

        res.json({ message: 'Password successfully reset' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

// 📄 ดึงแผนกทั้งหมด
app.get('/api/departments', (req, res) => {
    const sql = 'SELECT department_id, department_name FROM department';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// 📄 ดึงข้อมูลแผนกที่ระบุ (ตาม department_id)
app.get('/api/departments/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT department_id, department_name FROM department WHERE department_id = ?';
    
    connection.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(results[0]);  // ส่งข้อมูลแผนกที่ตรงกับ department_id
    });
});



// 📤 อัปโหลดไฟล์
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size, filename, path: filePath } = req.file;
    const { userId } = req.user; // รับ userId จาก JWT token

    // ข้อมูลไฟล์ที่จะบันทึกลงในฐานข้อมูล
    const sql = 'INSERT INTO files (file_name, file_type, file_size, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?)';
    const values = [originalname, mimetype, size, filePath, userId];

    connection.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save file data', details: err });
        }
        res.json({ message: 'File uploaded successfully', fileId: result.insertId });
    });
});

// 📄 ดึงข้อมูลไฟล์ทั้งหมด
app.get('/api/files', authenticateToken, (req, res) => {
    const sql = 'SELECT file_id, file_name, file_type, file_size, file_path, uploaded_by, upload_date FROM files';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// 📄 ดึงข้อมูลไฟล์ตาม ID
app.get('/api/files/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT file_id, file_name, file_type, file_size, file_path, uploaded_by, upload_date FROM files WHERE file_id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'File not found' });
        res.json(results[0]);
    });
});


// 📥 ดาวน์โหลดไฟล์
app.get('/api/files/download/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT file_path, file_name FROM files WHERE file_id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'File not found' });

        const file = results[0];
        res.download(file.file_path, file.file_name, (err) => {
            if (err) {
                res.status(500).json({ error: 'File download failed', details: err });
            }
        });
    });
});


// ❌ ลบไฟล์
app.delete('/api/files/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    // ค้นหาไฟล์ในฐานข้อมูล
    const sql = 'SELECT file_path FROM files WHERE file_id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'File not found' });

        const file = results[0];
        
        // ลบไฟล์จากระบบไฟล์
        fs.unlink(file.file_path, (err) => {
            if (err) return res.status(500).json({ error: 'File deletion failed', details: err });

            // ลบข้อมูลไฟล์จากฐานข้อมูล
            const deleteSql = 'DELETE FROM files WHERE file_id = ?';
            connection.query(deleteSql, [id], (err, result) => {
                if (err) return res.status(500).json({ error: 'Database error', details: err });
                res.json({ message: 'File deleted successfully' });
            });
        });
    });
});

// ดึงข้อมูลโปรเจคทั้งหมด
app.get('/api/projects', (req, res) => {
    connection.query('SELECT * FROM project', (err, results) => {
      if (err) {
        console.error('Error fetching projects:', err);
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }
      res.json(results);
    });
});
  
// ดึงข้อมูลโปรเจคตาม ID
app.get('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM project WHERE project_id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error fetching project:', err);
        return res.status(500).json({ error: 'Failed to fetch project' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(results[0]);
    });
});

// ดึงข้อมูลโปรเจคที่อยู่ในแผนกที่ระบุ
app.get('/api/projects/department/:departmentId', (req, res) => {
    const { departmentId } = req.params;
    if (!departmentId) {
        return res.status(400).json({ error: 'Department ID is required' });
    }
    connection.query('SELECT * FROM project WHERE department_id = ?', [departmentId], (err, results) => {
      if (err) {
        console.error('Error fetching projects:', err);
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }
      res.json(results);
    });
});


  
// เพิ่มโปรเจคใหม่
app.post('/api/projects', (req, res) => {
    const { project_name, description, department_id } = req.body;
    connection.query(
      'INSERT INTO project (project_name, description, department_id) VALUES (?, ?, ?)',
      [project_name, description, department_id],
      (err, results) => {
        if (err) {
          console.error('Error adding project:', err);
          return res.status(500).json({ error: 'Failed to add project' });
        }
        res.status(201).json({
          message: 'Project added successfully',
          project_id: results.insertId,
        });
      }
    );
});
  
// แก้ไขโปรเจค
app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const { project_name, description, department_id } = req.body;
    connection.query(
      'UPDATE project SET project_name = ?, description = ?, department_id = ? WHERE project_id = ?',
      [project_name, description, department_id, id],
      (err, results) => {
        if (err) {
          console.error('Error updating project:', err);
          return res.status(500).json({ error: 'Failed to update project' });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ message: 'Project updated successfully' });
      }
    );
});
  
// ลบโปรเจค
app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM project WHERE project_id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error deleting project:', err);
        return res.status(500).json({ error: 'Failed to delete project' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    });
});



// 🚀 Start Server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
