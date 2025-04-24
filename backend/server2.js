require('dotenv').config({ path: './server.env' });
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const bodyParser = require('body-parser');


const app = express();
const port = 3000;
app.use(bodyParser.json());

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token not provided' });
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;  // ใช้ข้อมูลผู้ใช้จาก decoded token
    next();
  });
};

app.use('/api/folders', authenticate);  // ใช้ middleware สำหรับตรวจสอบการอนุญาต  


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


// Function to dynamically set the upload destination based on project/folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // ตั้งพาธที่จะเก็บไฟล์
      const uploadDir = path.join(__dirname, 'uploads'); // ใช้ path.join เพื่อสร้างพาธที่ถูกต้อง
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // ตั้งชื่อไฟล์
      const uniqueName = Date.now() + path.extname(file.originalname);
      cb(null, uniqueName); // ตั้งชื่อไฟล์ที่ไม่ซ้ำ
    }
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
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM user WHERE username = ?';

    connection.query(sql, [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];
        console.log('User found:', user);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // สร้าง JWT token
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role },
            secretKey,
            { expiresIn: '24h' }
        );

        // 🔒 บันทึก log ก่อน แล้วค่อยตอบกลับ
        const logSql = 'INSERT INTO user_logs (user_id, action, timestamp) VALUES (?, ?, NOW())';
        connection.query(logSql, [user.user_id, 'login'], (logErr) => {
            if (logErr) {
                console.error('Failed to log login action:', logErr);
            } else {
                console.log(`Login action logged for user ${user.username}`);
            }

            // ✅ ตอบกลับ client หลัง log
            res.json({ token, user });
        });
    });
});

app.post('/api/logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];  // ดึง token จาก header

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });  // หากไม่มี token
    }

    try {
        // ตรวจสอบ token
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.user_id;
        const username = decoded.username;  // ดึง username จาก token

        // บันทึกการออกจากระบบลงใน user_logs
        const logSql = 'INSERT INTO user_logs (user_id, action, timestamp) VALUES (?, ?, NOW())';
        connection.query(logSql, [userId, 'logout'], (err, result) => {
            if (err) {
                console.error('Error logging logout action:', err);
                return res.status(500).json({ message: 'Failed to log logout action' });
            }

            // แสดงข้อความใน console เมื่อผู้ใช้ล็อกเอ้า
            console.log(`${username} has logged out at ${new Date().toLocaleString()}`);

            // หากบันทึกสำเร็จ
            res.json({ message: 'Logout successful' });
        });

    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });  // หาก token ไม่ถูกต้อง
    }
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
// Node.js API
app.get('/api/users', (req, res) => {
    const sql = 'SELECT user_id, username, firstname, lastname, email, role, department_id FROM user';
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);  // ตอบกลับในรูปแบบ JSON
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

// 📄 ดึงจำนวนผู้ใช้ต่อแผนก
app.get('/api/users-per-department', (req, res) => {
    const sql = `
      SELECT d.department_name, COUNT(u.user_id) AS user_count
      FROM department d
      LEFT JOIN user u ON d.department_id = u.department_id
      GROUP BY d.department_id
      ORDER BY user_count DESC
    `;
    connection.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    });
  });
  
// ดึงสมาชิกแผนกตาม ID
app.get('/api/departments/:id/users', (req, res) => {
    const departmentId = req.params.id;
    const sql = `SELECT user_id, firstname, lastname, email, role FROM user WHERE department_id = ?`;

    connection.query(sql, [departmentId], (err, results) => {
        if (err) {
            console.error('Error fetching department users:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// ดึงสมาชิกทั้งหมดในแผนก
app.get('/api/departments/:id/users', (req, res) => {
    const departmentId = req.params.id;
    const sql = `
        SELECT user_id, firstname, lastname, email, role
        FROM user
        WHERE department_id = ?
    `;
    connection.query(sql, [departmentId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// 📌 เพิ่มผู้ใช้เข้าแผนก (อัปเดต department_id)
app.put('/api/users/:id/assign-department', (req, res) => {
    const userId = req.params.id;
    const { department_id } = req.body;

    const sql = `UPDATE user SET department_id = ? WHERE user_id = ?`;
    connection.query(sql, [department_id, userId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'User assigned to department successfully' });
    });
});

// PUT /api/users/:id/assign-department
app.put('/api/users/:id/assign-department', (req, res) => {
    const userId = req.params.id;
    const { department_id } = req.body;

    const sql = `UPDATE user SET department_id = ? WHERE user_id = ?`;
    connection.query(sql, [department_id, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'User assigned to department successfully' });
    });
});


  
  // ลบผู้ใช้ในแผนก
  app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = `DELETE FROM user WHERE user_id = ?`;
    connection.query(sql, [userId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'User deleted successfully' });
    });
  });
  
  // เพิ่มผู้ใช้ใหม่ในแผนก
  app.post('/api/users', (req, res) => {
    const { username, password, firstname, lastname, email, role, department_id } = req.body;
    const sql = `
      INSERT INTO user (username, password, firstname, lastname, email, role, department_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    connection.query(sql, [username, password, firstname, lastname, email, role, department_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(201).json({ message: 'User created', userId: result.insertId });
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

app.put('/api/projects/:project_id', async (req, res) => {
    const { project_id } = req.params;
    const { status } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE project SET status = ? WHERE project_id = ?',
        [status, project_id]
      );
      res.status(200).json({ message: 'Project status updated successfully' });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  // ในไฟล์ server.js หรือ route ของโปรเจกต์
// ดึงข้อมูลผู้ใช้ในโปรเจกต์
// 📄 ดึงผู้ใช้ทั้งหมดในโปรเจกต์ที่ระบุ
app.get('/api/projects/:projectId/users', (req, res) => {
  const { projectId } = req.params;

  const sql = `
    SELECT u.user_id, u.username, u.firstname, u.lastname, u.email, u.role, u.department_id
    FROM user u
    JOIN user_project up ON u.user_id = up.user_id
    WHERE up.project_id = ?
  `;

  connection.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/projects/:projectId/available-users', (req, res) => {
  const { projectId } = req.params;

  const sql = `
    SELECT u.user_id, u.username, u.firstname, u.lastname, u.email, u.role, u.department_id
    FROM user u
    WHERE u.user_id NOT IN (
      SELECT up.user_id
      FROM user_project up
      WHERE up.project_id = ?
    )
  `;

  connection.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});


  
// ➕ สร้างโปรเจค
app.post('/api/projects', (req, res) => {
    const { project_name, description, department_id } = req.body;

    if (!project_name || !description || !department_id) {
        return res.status(400).json({ error: 'Project name, description, and department ID are required' });
    }

    const sql = 'INSERT INTO project (project_name, description, department_id) VALUES (?, ?, ?)';
    const values = [project_name, description, department_id];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating project:', err);
            return res.status(500).json({ error: 'Failed to create project' });
        }
        res.status(201).json({ message: 'Project created successfully', project_id: result.insertId });
    });
});

// 📝 แก้ไขโปรเจค
app.put('/api/projects/:project_id', (req, res) => {
    const { project_id } = req.params;
    const { project_name, description, department_id, status } = req.body;

    if (!project_name && !description && !department_id && !status) {
        return res.status(400).json({ error: 'At least one field (project_name, description, department_id, status) is required to update' });
    }

    let fields = [];
    let values = [];

    if (project_name) {
        fields.push('project_name = ?');
        values.push(project_name);
    }
    if (description) {
        fields.push('description = ?');
        values.push(description);
    }
    if (department_id) {
        fields.push('department_id = ?');
        values.push(department_id);
    }
    if (status) {
        fields.push('status = ?');
        values.push(status);
    }

    const sql = `UPDATE project SET ${fields.join(', ')} WHERE project_id = ?`;
    values.push(project_id);

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating project:', err);
            return res.status(500).json({ error: 'Failed to update project' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ message: 'Project updated successfully' });
    });
});

// เพิ่มผู้ใช้เข้าโปรเจกต์
// เพิ่มผู้ใช้เข้าโปรเจกต์
app.post('/api/projects/:projectId/add-user', async (req, res) => {
  const projectId = req.params.projectId;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'กรุณาระบุ userId' });
  }

  try {
    const db = connection.promise();

    // ตรวจสอบว่าผู้ใช้นี้อยู่ในโปรเจกต์แล้วหรือยัง
    const [existing] = await db.query(
      'SELECT * FROM user_project WHERE user_id = ? AND project_id = ?',
      [userId, projectId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'ผู้ใช้นี้อยู่ในโปรเจกต์แล้ว' });
    }

    // เพิ่มผู้ใช้เข้าโปรเจกต์
    await db.query(
      'INSERT INTO user_project (user_id, project_id) VALUES (?, ?)',
      [userId, projectId]
    );

    // ✅ บันทึกลง user_logs เพื่อให้ notification ไปแสดงผลได้
    await db.query(
      'INSERT INTO user_logs (user_id, action, project_id, timestamp) VALUES (?, ?, ?, NOW())',
      [userId, 'added to project', projectId]
    );

    res.json({ message: 'เพิ่มผู้ใช้เข้าโปรเจกต์เรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

// สมมุติว่า route นี้อยู่ใน server.js หรือ controller
app.delete('/api/projects/:projectId/users/:userId', async (req, res) => {
  const { projectId, userId } = req.params;

  try {
    const db = connection.promise();

    // ตรวจสอบก่อนว่าผู้ใช้อยู่ในโปรเจกต์จริงไหม
    const [existing] = await db.query(
      'SELECT * FROM user_project WHERE user_id = ? AND project_id = ?',
      [userId, projectId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้ในโปรเจกต์' });
    }

    // ลบออกจากโปรเจกต์
    await db.query(
      'DELETE FROM user_project WHERE user_id = ? AND project_id = ?',
      [userId, projectId]
    );

    // บันทึก log
    await db.query(
      'INSERT INTO user_logs (user_id, action, project_id, timestamp) VALUES (?, ?, ?, NOW())',
      [userId, 'removed from project', projectId]
    );

    res.json({ message: 'ลบผู้ใช้ออกจากโปรเจกต์เรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

// PUT /api/projects/:projectId/status
app.put('/projects/:projectId/status', async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;

  const validStatuses = ['In Progress', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    await connection.query('UPDATE project SET status = ? WHERE project_id = ?', [status, projectId]);
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error while updating status' });
  }
});



// ❌ ลบโปรเจค
app.delete('/api/projects/:project_id', (req, res) => {
    const { project_id } = req.params;

    const sql = 'DELETE FROM project WHERE project_id = ?';
    connection.query(sql, [project_id], (err, result) => {
        if (err) {
            console.error('Error deleting project:', err);
            return res.status(500).json({ error: 'Failed to delete project' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    });
});



// API สำหรับอัปโหลดไฟล์
app.post('/api/files', upload.single('file'), (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Save file info to the database (optional)
  const sql = "INSERT INTO file (file_name, file_size, project_id, folder_id) VALUES (?, ?, ?, ?)";
  const projectId = req.body.project_id;
  const folderId = req.body.folder_id || null;
  
  connection.query(sql, [file.filename, file.size, projectId, folderId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: 'Error saving file info to database' });
    }
    console.log("Uploaded file:", file);
    res.status(200).json({ message: 'File uploaded successfully', file: file });
  });
});

  
  

app.post('/api/files', upload.single('file'), (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // เก็บข้อมูลเวลาในการอัปโหลด
  const uploadDate = new Date(); // ใช้ `new Date()` เพื่อเก็บวันที่ปัจจุบัน

  // เพิ่มข้อมูลในฐานข้อมูลรวมทั้งเวลาที่อัปโหลด
  const sql = `
    INSERT INTO file (file_name, file_type, file_size, upload_date, uploaded_by, project_id, folder_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const uploadedBy = req.body.uploaded_by || null; // ตรวจสอบผู้ที่อัปโหลด
  const projectId = req.body.project_id;
  const folderId = req.body.folder_id || null;
  
  connection.query(sql, [file.filename, file.mimetype, file.size, uploadDate, uploadedBy, projectId, folderId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: 'Error saving file info to database' });
    }
    res.status(200).json({ message: 'File uploaded successfully', file: file });
  });
});




app.get('/api/files/download/:file_id', (req, res) => {
    const { file_id } = req.params;

    const sql = 'SELECT * FROM file WHERE file_id = ?';
    connection.query(sql, [file_id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'File not found' });

        const file = results[0];
        const filePath = path.join(__dirname, 'uploads', file.file_name);
        res.download(filePath, file.file_name);
    });
});


app.put('/api/files/:file_id', authenticateToken, (req, res) => {
    const { file_id } = req.params;
    const { project_id, folder_id } = req.body;

    let fields = [];
    let values = [];

    if (project_id) {
        fields.push('project_id = ?');
        values.push(project_id);
    }

    if (folder_id) {
        fields.push('folder_id = ?');
        values.push(folder_id);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(file_id);
    const sql = `UPDATE file SET ${fields.join(', ')} WHERE file_id = ?`;

    connection.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update file info' });
        res.json({ message: 'File info updated successfully' });
    });
});


app.delete('/api/files/:file_id', authenticateToken, (req, res) => {
    const { file_id } = req.params;

    const sql = 'SELECT file_name FROM file WHERE file_id = ?';
    connection.query(sql, [file_id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'File not found' });

        const filePath = path.join(__dirname, 'uploads', results[0].file_name);

        fs.unlink(filePath, (err) => {
            if (err) console.warn('⚠️ File deletion failed from storage:', err);

            connection.query('DELETE FROM file WHERE file_id = ?', [file_id], (err, result) => {
                if (err) return res.status(500).json({ error: 'Failed to delete file' });
                res.json({ message: 'File deleted successfully' });
            });
        });
    });
});


// ทั้งหมด
app.get('/api/files', (req, res) => {
    connection.query('SELECT * FROM file', (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch files' });
        res.json(results);
    });
});

// ตาม project_id
app.get('/api/files/project/:project_id', (req, res) => {
    connection.query('SELECT * FROM file WHERE project_id = ?', [req.params.project_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch project files' });
        res.json(results);
    });
});

// ตาม uploaded_by
app.get('/api/files/user/:user_id', (req, res) => {
    connection.query('SELECT * FROM file WHERE uploaded_by = ?', [req.params.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch user files' });
        res.json(results);
    });
});

// ดึงโฟลเดอร์ทั้งหมดในโปรเจค
app.get('/api/folders/project/:project_id', (req, res) => {
    const { project_id } = req.params;
    connection.query('SELECT * FROM folder WHERE project_id = ?', [project_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch folders' });
        res.json(results);
    });
});

// ดึงไฟล์ทั้งหมดในโฟลเดอร์
app.get('/api/files/folder/:folder_id', (req, res) => {
    const { folder_id } = req.params;
    connection.query('SELECT * FROM file WHERE folder_id = ?', [folder_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch folder files' });
        res.json(results);
    });
});

// ตรวจสอบว่าเส้นทางนี้มีการตั้งค่าไว้หรือไม่
app.get('/api/folders/project/:projectId', (req, res) => {
    const { projectId } = req.params;
    const sql = 'SELECT * FROM folder WHERE project_id = ?';
    connection.query(sql, [projectId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch folders' });
      res.json(results); // ส่งข้อมูลโฟลเดอร์กลับไป
    });
  });
  
  app.post('/api/folder/permission', (req, res) => {
    const { folder_id, user_id, project_id, permission_type } = req.body;
  
    const sql = `
      INSERT INTO folder_permission (folder_id, user_id, project_id, permission_type, granted_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
  
    connection.query(sql, [folder_id, user_id, project_id, permission_type], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to grant permission' });
      res.status(201).json({ message: 'Permission granted successfully' });
    });
  });

  
  app.get('/api/folder/permissions/:folder_id', (req, res) => {
    const { folder_id } = req.params;
  
    const sql = `
      SELECT user_id, permission_type FROM folder_permission
      WHERE folder_id = ?
    `;
    
    connection.query(sql, [folder_id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch permissions' });
      res.json(results);
    });
  });
  

  app.get('/api/files/folder/:folder_id', (req, res) => {
    const { folder_id } = req.params;
    const { user_id } = req.query; // รับ user_id จาก query params
    
    // ตรวจสอบสิทธิ์ของผู้ใช้ในการเข้าถึงโฟลเดอร์
    const permissionSql = `
      SELECT permission_type FROM folder_permission
      WHERE folder_id = ? AND user_id = ?
    `;
    
    connection.query(permissionSql, [folder_id, user_id], (err, permissions) => {
      if (err || permissions.length === 0) return res.status(403).json({ error: 'No permission to access this folder' });
      
      const permissionType = permissions[0].permission_type;
      
      // ถ้าผู้ใช้มีสิทธิ์ในการอ่าน (read) หรือเป็น admin
      if (permissionType === 'read' || permissionType === 'can edit' || permissionType === 'admin') {
        const fileSql = `
          SELECT * FROM file WHERE folder_id = ?
        `;
        
        connection.query(fileSql, [folder_id], (err, files) => {
          if (err) return res.status(500).json({ error: 'Failed to fetch files' });
          res.json(files);
        });
      } else {
        return res.status(403).json({ error: 'No permission to access files' });
      }
    });
  });

  // /api/drive/:project_id?folder_id= (ถ้าไม่มี folder_id ให้แสดง root)
  app.get('/api/drive/:project_id', (req, res) => {
    const { project_id } = req.params;
    const folder_id = req.query.folder_id || null;
  
    // SQL query สำหรับดึงข้อมูลโฟลเดอร์
    const foldersSql = `
      SELECT 
        folder_id as id, 
        folder_name as name, 
        'folder' as type,
        NULL as file_type,
        NULL as file_size,
        NULL as upload_date
      FROM folder 
      WHERE project_id = ? AND parent_folder_id ${folder_id ? '= ?' : 'IS NULL'}
    `;
  
    // SQL query สำหรับดึงข้อมูลไฟล์
    const filesSql = `
      SELECT 
        file_id as id, 
        file_name as name, 
        'file' as type,
        file_type, 
        file_size, 
        upload_date
      FROM file 
      WHERE project_id = ? AND folder_id ${folder_id ? '= ?' : 'IS NULL'}
    `;
  
    const folderValues = folder_id ? [project_id, folder_id] : [project_id];
    const fileValues = folder_id ? [project_id, folder_id] : [project_id];
  
    // ดึงข้อมูลโฟลเดอร์
    connection.query(foldersSql, folderValues, (err, folderResults) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch folders' });
  
      // ดึงข้อมูลไฟล์
      connection.query(filesSql, fileValues, (err, fileResults) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch files' });
  
        // รวมผลลัพธ์ของโฟลเดอร์และไฟล์
        const combined = [...folderResults, ...fileResults];
        
        // จัดเรียงผลลัพธ์ (ให้โฟลเดอร์อยู่ก่อนแล้วตามด้วยไฟล์)
        combined.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
  
        // ส่งผลลัพธ์กลับเป็น JSON
        res.json(combined);
      });
    });
  });
  
// เพิ่ม middleware 'authenticateToken' ก่อนที่จะทำการสร้างโฟลเดอร์
app.post('/api/folders', authenticateToken, (req, res) => {
  const { folder_name, project_id, parent_folder_id } = req.body;

  // ตรวจสอบว่า user ได้รับการยืนยันหรือไม่
  if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
  }

  // ตรวจสอบว่าได้รับข้อมูลที่จำเป็นหรือไม่
  if (!folder_name || !project_id) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log("Received data:", req.body);
  console.log("User ID:", req.user ? req.user.id : "No user data");

  const sql = `
      INSERT INTO folder (folder_name, project_id, parent_folder_id)
      VALUES (?, ?, ?)
  `;
  
  // ใช้ query เพื่อเพิ่มโฟลเดอร์ใหม่
  connection.query(sql, [folder_name, project_id, parent_folder_id || null], (err, result) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: 'Failed to create folder' });
      }
      res.status(201).json({ message: 'Folder created', folder_id: result.insertId });
  });
});


//ดึง bookmark
app.get('/api/bookmarks/:id', (req, res) => {
    const { id } = req.params;
  
    connection.query(
      'SELECT name, date_shared AS dateShared, type, status FROM bookmarks WHERE id = ?',
      [id],
      (err, results) => {
        if (err) {
          console.error('Error fetching bookmark:', err);
          return res.status(500).json({ error: 'Failed to fetch bookmark' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ error: 'Bookmark not found' });
        }
  
        res.json(results[0]);
      }
    );
  });

// ส่งข้อความทั่วไป (user → admin หรือ user ↔ user)
app.post('/api/chat/send-message', async (req, res) => {
    const { sender_id, receiver_id, message_text } = req.body;

    if (!message_text || !receiver_id || !sender_id) {
        return res.status(400).json({ error: 'Message text, sender_id, and receiver_id are required' });
    }

    try {
        // ตรวจสอบ role ของ sender
        const [senderResult] = await db.query('SELECT role FROM user WHERE user_id = ?', [sender_id]);
        const [receiverResult] = await db.query('SELECT role FROM user WHERE user_id = ?', [receiver_id]);

        if (senderResult.length === 0 || receiverResult.length === 0) {
            return res.status(404).json({ error: 'Sender or receiver not found' });
        }

        const senderRole = senderResult[0].role;
        const receiverRole = receiverResult[0].role;

        // ❌ ไม่อนุญาตให้ user คุยกับ user
        if (senderRole === 'user' && receiverRole === 'user') {
            return res.status(403).json({ error: 'Users can only chat with admin' });
        }

        // ✅ ดำเนินการสร้างหรือหาการสนทนา
        let conversationId;
        const [existingConversation] = await db.query(`
            SELECT * FROM conversations 
            WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
        `, [sender_id, receiver_id, receiver_id, sender_id]);

        if (existingConversation.length > 0) {
            conversationId = existingConversation[0].conversation_id;
        } else {
            const result = await db.query(`
                INSERT INTO conversations (user1_id, user2_id, created_at)
                VALUES (?, ?, NOW())
            `, [sender_id, receiver_id]);
            conversationId = result.insertId;
        }

        const [messageResult] = await db.query(`
            INSERT INTO messages (sender_id, receiver_id, message_text, timestamp, is_read, message_type, file_url, conversation_id)
            VALUES (?, ?, ?, NOW(), 0, 'text', NULL, ?)
        `, [sender_id, receiver_id, message_text, conversationId]);

        const newMessageId = messageResult.insertId;

        await db.query(`UPDATE conversations SET last_message_id = ? WHERE conversation_id = ?`, [newMessageId, conversationId]);

        res.status(200).json({ message: 'Message sent successfully', message_id: newMessageId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error sending message' });
    }
});



// ฟังก์ชันดึง role
function getUserRole(userId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT role FROM user WHERE user_id = ?', [userId], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject("User not found");
            resolve(results[0].role);
        });
    });
}


// function getAdminId() {
//     return new Promise((resolve, reject) => {
//         const sql = "SELECT User_id FROM user WHERE role = 'admin' LIMIT 1";
//         connection.query(sql, (err, results) => {
//             if (err) return reject(err);
//             if (results.length === 0) return reject("Admin not found");
//             resolve(results[0].User_id);
//         });
//     });
// }

const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
        console.log({
            sender_id: senderId,
            receiver_id: receiverId,
            message_text: messageText
        });

        const response = await axios.post('http://localhost:3000/api/chat/send-message', {
            sender_id: senderId,
            receiver_id: receiverId,
            message_text: messageText
        });

        console.log('Message sent:', response.data);

        setMessages(prev => [...prev, {
            sender_id: senderId,
            receiver_id: receiverId,
            message_text: messageText,
            timestamp: new Date().toISOString()
        }]);

        setMessageText('');
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error);
    }
};


app.get('/api/chat/messages/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        const sql = `
            SELECT sender_id, receiver_id, message_text, timestamp 
            FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
            OR (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp ASC
        `;
        
        connection.query(sql, [senderId, receiverId, receiverId, senderId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching messages' });
            }

            // ส่งข้อความทั้งหมดที่ดึงได้
            res.status(200).json({ messages: results });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get('/api/chat/conversations/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT 
            u.user_id, u.username, m.message_text AS last_message, m.timestamp
        FROM users u
        JOIN (
            SELECT 
                IF(sender_id = ?, receiver_id, sender_id) AS partner_id,
                MAX(message_id) AS last_msg_id
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY partner_id
        ) AS last_msgs ON last_msgs.partner_id = u.user_id
        JOIN messages m ON m.message_id = last_msgs.last_msg_id
        ORDER BY m.timestamp DESC
    `;

    connection.query(sql, [userId, userId, userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching conversations' });
        res.status(200).json({ conversations: results });
    });
});

app.patch('/api/chat/mark-read', (req, res) => {
    const { sender_id, receiver_id } = req.body;

    const sql = `
        UPDATE messages 
        SET is_read = 1 
        WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `;

    connection.query(sql, [sender_id, receiver_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to mark messages as read' });
        res.status(200).json({ message: 'Messages marked as read' });
    });
});


app.get('/api/chat/unread-count/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT COUNT(*) AS unread_count 
        FROM messages 
        WHERE receiver_id = ? AND is_read = 0
    `;

    connection.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to count unread messages' });
        res.status(200).json(results[0]);
    });
});


app.delete('/api/chat/message/:messageId', (req, res) => {
    const messageId = req.params.messageId;

    const sql = 'DELETE FROM messages WHERE message_id = ?';

    connection.query(sql, [messageId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to delete message' });
        res.status(200).json({ message: 'Message deleted successfully' });
    });
});

app.post('/api/chat/send', (req, res) => {
    const { sender_id, receiver_id, message_text, message_type, file_url } = req.body;

    const sql = `
        INSERT INTO messages (sender_id, receiver_id, message_text, timestamp, is_read, message_type, file_url)
        VALUES (?, ?, ?, NOW(), 0, ?, ?)
    `;

    connection.query(sql, [sender_id, receiver_id, message_text, message_type || 'text', file_url || null], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to send message' });

        res.status(201).json({ message: 'Message sent successfully', message_id: result.insertId });
    });
});

// ✅ API: Notifications – เมื่อผู้ใช้ถูกเพิ่มเข้าโปรเจกต์ (แสดงชื่อโปรเจกต์ด้วย)
app.get('/api/notifications', (req, res) => {
  const sql = `
    SELECT 
      u.user_id,
      CONCAT(u.firstname, ' ', u.lastname) AS user_fullname,
      u.role,
      d.department_name,
      p.project_name,
      ul.timestamp
    FROM user_logs ul
    JOIN user u ON ul.user_id = u.user_id
    JOIN department d ON u.department_id = d.department_id
    JOIN project p ON ul.project_id = p.project_id
    WHERE ul.action = 'added to project'
    ORDER BY ul.timestamp DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});


  

  // 📄 API สำหรับเพิ่มการแจ้งเตือน
app.post('/api/notifications', (req, res) => {
    const { userId, departmentId, message } = req.body;
    const timestamp = new Date().toISOString();
    const sql = `
        INSERT INTO notifications (user_id, department_id, message, timestamp)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(sql, [userId, departmentId, message, timestamp], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Notification created successfully' });
    });
});

// 📄 API สำหรับเพิ่มผู้ใช้ใหม่
app.post('/api/users', (req, res) => {
    const { username, firstname, lastname, email, role, department_id } = req.body;
    const sql = `
        INSERT INTO user (username, firstname, lastname, email, role, department_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(sql, [username, firstname, lastname, email, role, department_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const userId = results.insertId; // get user_id of newly inserted user
        const message = `${firstname} ${lastname} ถูกเพิ่มเข้าระบบ`; // สร้างข้อความแจ้งเตือน

        // บันทึกการแจ้งเตือน
        const notificationSql = `
            INSERT INTO notifications (user_id, department_id, message, timestamp)
            VALUES (?, ?, ?, ?)
        `;
        const timestamp = new Date().toISOString();
        connection.query(notificationSql, [userId, department_id, message, timestamp], (err, notificationResults) => {
            if (err) {
                console.error('Error saving notification:', err);
                return res.status(500).json({ error: 'Failed to save notification' });
            }

            res.status(201).json({ message: 'User added and notification sent' });
        });
    });
});

// เพิ่มในไฟล์หลักของคุณ (เช่น app.js หรือ server.js)
app.get('/api/activity-logs', (req, res) => {
    const query = `
      SELECT l.id, u.username, l.action, l.timestamp, f.file_name
      FROM (
        SELECT id, user_id, action, timestamp, file_id FROM file_logs
        UNION ALL
        SELECT id, user_id, action, timestamp, NULL as file_id FROM user_logs
      ) AS l
      JOIN user u ON l.user_id = u.user_id
      LEFT JOIN file f ON l.file_id = f.file_id
      ORDER BY l.timestamp DESC
    `;
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching activity logs:', err);
        return res.status(500).json({ error: 'Failed to fetch activity logs' });
      }
  
      res.json(results);
    });
  });
  
  // 📄 backend/routes/activityLogs.js (หรือรวมไว้ในไฟล์หลักก็ได้)
  app.get('/api/activity-logs', (req, res) => {
      const sql = `
          SELECT 
              l.id,
              u.username,
              l.action,
              f.file_name,
              l.timestamp
          FROM (
              SELECT id, user_id, action, timestamp, NULL AS file_id FROM user_logs
              UNION ALL
              SELECT id, user_id, action, timestamp, file_id FROM file_logs
          ) AS l
          LEFT JOIN user u ON l.user_id = u.user_id
          LEFT JOIN file f ON l.file_id = f.file_id
          ORDER BY l.timestamp DESC
          LIMIT 100
      `;
  
      connection.query(sql, (err, results) => {
          if (err) {
              console.error('Error fetching activity logs:', err);
              return res.status(500).json({ error: 'Internal server error' });
          }
  
          res.json(results);
      });
  });

  // ✅ เพิ่มบุ๊คมาร์ค
app.post('/bookmark', (req, res) => {
    const user_id = req.user.id;
    const { item_id, item_type, project_id } = req.body;
  
    const sql = `
      INSERT INTO bookmark (user_id, item_id, item_type, project_id)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE bookmarked_at = CURRENT_TIMESTAMP
    `;
  
    connection.query(sql, [user_id, item_id, item_type, project_id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Bookmarked successfully' });
    });
  });
  
  // 🗑️ ลบบุ๊คมาร์ค
  app.delete('/bookmark', (req, res) => {
    const user_id = req.user.id;
    const { item_id, item_type } = req.body;
  
    const sql = `DELETE FROM bookmark WHERE user_id = ? AND item_id = ? AND item_type = ?`;
    connection.query(sql, [user_id, item_id, item_type], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Bookmark removed' });
    });
  });
  
  // 📄 ดึงบุ๊คมาร์คทั้งหมดของผู้ใช้
  app.get('/bookmark',  (req, res) => {
    const user_id = req.user.id;
  
    const sql = `
      SELECT * FROM bookmark
      WHERE user_id = ?
      ORDER BY bookmarked_at DESC
    `;
    connection.query(sql, [user_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });


// 🚀 Start Server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
