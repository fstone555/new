require('dotenv').config({ path: './server.env' });
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { console } = require('inspector');
const swaggerJSDoc = require('swagger-jsdoc');  // นำเข้า swagger-jsdoc
const swaggerUi = require('swagger-ui-express');  // นำเข้า swagger-ui-express

const app = express();
const port = 3000;

// อ่านค่า secretKey จาก .env
const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
    console.error('❌ JWT_SECRET is not defined in .env file');
    process.exit(1); // หยุดการทำงานหากไม่มีการกำหนด JWT_SECRET
}

app.use(cors());
app.use(express.json());

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '[e-document]Project API Documentation',
            version: '1.0.0',
            description: 'นางสาวชุติกาญจน์ ขจรจิตต์ รหัส 66095181 สาขาวิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟแวร์ คณะเทคโนโลยีสารสนเทศ มหาวิทยาลัยศรีปทุม เป็นผู็สร้าง Back End API พร้อมจัดการทำเอกสารฉบับนี้ ในโครงงาน e-document Project Version 1.0.0 ตามมาตราฐาน OpenAPI 3.0 ประกอบด้วยUser - จำนวน 5 APIs',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./server.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);  // ใช้ชื่อที่ถูกต้องที่นี่
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ✅ Connect MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: '101'
});

connection.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err);
    } else {
        console.log('✅ Connected to MySQL');
<<<<<<< HEAD
    }
});

=======
        console.log(`Database: ${connection.config.database}`);
        console.log(`Host: ${connection.config.host}`);
        console.log(`User: ${connection.config.user}`);
    }
});


>>>>>>> 0634568 (update)
// 🔐 Middleware: ตรวจสอบ JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.userId = user.User_id;
        next();
    });
}

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a JWT token
 *       401:
 *         description: Invalid username or password
 */
// 🔐 ล็อกอิน
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    connection.query(sql, [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: 'Invalid username or password' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

        const token = jwt.sign({ User_id: user.User_id, username: user.username }, secretKey, { expiresIn: '1h' });
        res.json({ token, user });
    });
});

<<<<<<< HEAD
=======
// ฟังก์ชันรีเซ็ตรหัสผ่าน
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    // ตรวจสอบว่ามีอีเมลในระบบ
    const sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (results.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = 'UPDATE users SET password_hash = ? WHERE email = ?';

        connection.query(updateSql, [hashedPassword, email], (err, updateResults) => {
            if (err) return res.status(500).json({ error: 'Failed to update password' });
            res.json({ message: 'Password successfully reset' });
        });
    });
});


>>>>>>> 0634568 (update)
/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     responses:
 *       200:
 *         description: Returns a list of all departments   
 * 
 */

// 📦 ดึงแผนกทั้งหมด
app.get('/api/departments', (req, res) => {
    connection.query('SELECT * FROM departments', (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     responses:
 *       200:
 *         description: Returns a list of all projects
 */

// 📦 ดึงโปรเจคทั้งหมด
app.get('/api/projects', (req, res) => {
    connection.query('SELECT * FROM projects', (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *               description:
 *                 type: string
 *               department_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Project created successfully
 */


/**
 * @swagger
 * /api/projects/{project_id}:
 *   get:
 *     summary: Get a specific project by ID 1234
 *     parameters:
 *       - name: project_id
 *         in: path
 *         description: ID of the project to retrieve 1234
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the project object
 */
// ดีงบางโปรเจค
app.get('/api/projects/:project_id', (req, res) => {
    const { project_id } = req.params;  // รับค่า project_id จาก URL parameters
    connection.query('SELECT * FROM projects WHERE project_id = ?', [project_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json(results[0]);
    });
});


/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project 555
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *               description:
 *                 type: string
 *               department_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Project created successfully
 */
// 📦 สร้างโปรเจคใหม่ (ต้อง login)
// POST API สำหรับสร้างโปรเจค
app.post('/api/projects', authenticateToken, (req, res) => {
    const { project_name, description, department_id } = req.body; // ดึงค่าจาก body
    const updatedBy = req.userId; // ใช้ userId จาก Token (JWT)

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบหรือไม่
    if (!project_name || !description || !department_id || !updatedBy) {
        return res.status(400).json({ error: 'Missing required fields' }); // ถ้าไม่มีข้อมูลครบ ส่งสถานะ 400
    }

    // คำสั่ง SQL สำหรับเพิ่มข้อมูลโปรเจคใหม่
    const sql = 'INSERT INTO projects (project_name, description, department_id, created_at, updated_at, updated_by) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)';
    
    // ทำการ query ในฐานข้อมูล
    connection.query(sql, [project_name, description, department_id, updatedBy], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' }); // ถ้ามีข้อผิดพลาดในฐานข้อมูล ส่งสถานะ 500
        res.status(201).json({ message: 'Project created successfully', project_id: results.insertId }); // ถ้าเพิ่มสำเร็จ ส่งสถานะ 201 พร้อม project_id ที่สร้างขึ้น
    });
});


/**
 * @swagger
 * /api/projects/{project_id}/files:
 *   post:
 *     summary: Upload a file to a project
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
// 📁 อัปโหลดไฟล์เข้าโปรเจค
app.post('/api/projects/:project_id/files', upload.single('file'), (req, res) => {
    const { project_id } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const sql = 'INSERT INTO files (file_name, file_path, project_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)';
    connection.query(sql, [file.originalname, file.path, project_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.status(201).json({
            message: 'File uploaded successfully',
            file_id: results.insertId,
            file_name: file.originalname,
            file_path: file.path
        });
    });
});

/**
 * @swagger
 * /api/projects/{project_id}/files:
 *   get:
 *     summary: Get a files in a project 5555
 *     responses:
 *       200:
 *         description: Returns a list of all files in a project
 */
// 📁 ดึงไฟล์ในโปรเจค
app.get('/api/projects/:project_id/files', (req, res) => {
    const { project_id } = req.params;

    if (!project_id) return res.status(400).json({ error: 'Project ID is required' });
    connection.query('SELECT * FROM files WHERE project_id = ?', [project_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ message: 'No files found' });
        res.json({ message: 'Files fetched successfully', files: results });
    });
});



/**
 * @swagger
 * /api/projects/{project_id}/files/{file_id}:
 *   delete:
 *     summary: Delete a file from a project
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
// ลบไฟล์
app.delete('/api/projects/:project_id/files/:file_id', (req, res) => {
    const { project_id, file_id } = req.params;

    connection.query('DELETE FROM files WHERE project_id = ? AND file_id = ?', [project_id, file_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'File not found' });
        res.json({ message: 'File deleted successfully' });
    });
})

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users   
 *     responses:
 *       200:
 *         description: Returns a list of all users 
 * 
 */
// 👥 ดึงผู้ใช้ทั้งหมด
app.get('/api/users', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

/**
 * @swagger
 * /api/users/{user_id}:
 *   get:
 *     summary: Get a specific user by ID
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the user with the specified ID
 */
// 👤 ดึงผู้ใช้รายคน
app.get('/api/users/:user_id', (req, res) => {
    const { user_id } = req.params;  // รับค่า user_id จาก URL parameters

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    connection.query('SELECT * FROM users WHERE User_id = ?', [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error' });
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found', user_id });
        }

        res.json(results[0]);
    });
});





/**
 * @swagger
 * /api/users/{user_id}:
 *   put:
 *     summary: Update a user by ID
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email: 
 *                 type: string
 *               department_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User updated successfully
 */
// ✏️ อัปเดตข้อมูลผู้ใช้
app.put('/api/users/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const { username, password, first_name, last_name, email, department_id } = req.body;

    let hashedPassword = null;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    const updateValues = [
        username,
        first_name,
        last_name,
        email,
        department_id,
        hashedPassword || null,
        user_id
    ];

    const sql = `UPDATE users 
        SET 
            username = COALESCE(?, username), 
            first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            email = COALESCE(?, email),
            department_id = COALESCE(?, department_id),
            password_hash = COALESCE(?, password_hash)
        WHERE User_id = ?`;

    connection.query(sql, updateValues, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database update error' });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'User not found', user_id });
        res.json({ message: 'User updated successfully', user_id });
    });
});

/**
 * @swagger
 * /api/users/{user_id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
// ❌ ลบผู้ใช้
app.delete('/api/users/:user_id', (req, res) => {
    const { user_id } = req.params;
    connection.query('DELETE FROM users WHERE User_id = ?', [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database delete error' });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'User not found', user_id });
        res.json({ message: 'User deleted successfully', user_id });
    });
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email: 
 *                 type: string
 *               department_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User created successfully
 */
// 📦 เพิ่ม user
app.post('/api/users', async (req, res) => {
    console.log('👉 Incoming user:', req.body);

    const { username, password, first_name, last_name, email, department_id } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password_hash, first_name, last_name, email, department_id) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(sql, [username, hashedPassword, first_name, last_name, email, department_id], (err, results) => {
            if (err) {
                console.error('❌ Database insert error:', err); // ✅ log error จริง
                return res.status(500).json({ error: 'Database insert error', details: err.message });
            }
            res.status(201).json({ message: 'User created successfully' });
        });
    } catch (error) {
        console.error('❌ Hashing or logic error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// 🚀 Start Server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
<<<<<<< HEAD
=======
    console.log('✅ Connected to MySQL');
>>>>>>> 0634568 (update)
});
