const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


const app = express();
const PORT = 3000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4(); // Generate a unique identifier
    const fileExtension = path.extname(file.originalname); // Extract file extension
    cb(null, `${uniqueSuffix}${fileExtension}`); // Combine UUID with file extension
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG files are allowed'));
    }
  }
});

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'payroll_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


const promisePool = pool.promise();
// const db = pool; 
const db = pool.promise();  // <-- use the promise wrapper



// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(uploadDir));

// Test DB connection on startup
pool.getConnection((err, conn) => {
  if (err) {
    console.error('MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL');
  conn.release();
});

// Helper: Validate employee fields for creation/update
function validateEmployeeFields(req, res, next) {
  const { firstname, lastName, email } = req.body;
  if (!firstname || !lastName || !email) {
    return res.status(400).json({ error: 'Missing firstname, lastName, or email' });
  }
  next();
}

//------------------------------// Register ---------------------------------


// Register API
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const [result] = await promisePool.query(
      'INSERT INTO signin (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});
// Login API
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [results] = await db.query(
      'SELECT * FROM signin WHERE email = ? AND password = ?',
      [email, password]
    );

    if (results.length > 0) {
      const user = results[0];
      delete user.password;
      res.json({ success: true, message: 'Login successful', user });
    } else {
      res.json({ success: false, message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Login error' });
  }
});

//----------------------------------------------------------

// --------------------- Employee Routes ---------------------

// Create Employee
app.post('/api/employees', upload.single('image'), validateEmployeeFields, async (req, res) => {
  console.log('Incoming employee body:', req.body);

  try {
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const {
      firstname, lastName, email, inviteEmail, office, joiningDate, position,
      team, employmentType, countryOfEmployment, lineManager, currency,
      frequency, salary, departmentId = 1, status, role, phone,
      dob, address, bankName, bankAccountNo, ifscCode, bankAddress
    } = req.body;

    const name = `${firstname} ${lastName}`;

    const sql = `INSERT INTO employees (
      firstname, lastName, email, office, salary, role, status, position, team,
      departmentId, joiningDate, inviteEmail, employmentType,
      countryOfEmployment, lineManager, currency, frequency, name, image, phone,
      dob, address, bankName, bankAccountNo, ifscCode, bankAddress
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await promisePool.query(sql, [
      firstname,
      lastName,
      email,
      office,
      Number(salary),
      role,
      status,
      position,
      team,
      Number(departmentId),
      joiningDate ? new Date(joiningDate).toISOString().split('T')[0] : null,
      inviteEmail === 'true' || inviteEmail === true ? 1 : 0,
      employmentType,
      countryOfEmployment,
      lineManager,
      currency,
      frequency,
      name,
      image,
      phone,
      dob ? new Date(dob).toISOString().split('T')[0] : null,
      address,
      bankName,
      bankAccountNo,
      ifscCode,
      bankAddress
    ]);

    res.status(201).json({ message: 'Employee added', id: result.insertId });
  } catch (err) {
    console.error('Error creating employee:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get All Employees
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM employees');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Employee by ID
app.get('/api/employees/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Employee
// Update Employee
app.put('/api/employees/:id', upload.single('image'), validateEmployeeFields, async (req, res) => {
  console.log('Incoming employee body:', req.body);
  try {
    const { id } = req.params;

    const {
      firstname, lastName, email, inviteEmail, office, joiningDate, position,
      team, employmentType, countryOfEmployment, lineManager, currency,
      frequency, salary, departmentId, status, role, image: existingImage, phone,
      dob, address, bankName, bankAccountNo, ifscCode, bankAddress
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : existingImage;
    const name = `${firstname} ${lastName}`;

    const sql = `UPDATE employees SET
      firstname = ?, lastName = ?, email = ?, office = ?, salary = ?, role = ?, status = ?,
      position = ?, team = ?, departmentId = ?, joiningDate = ?, inviteEmail = ?, employmentType = ?,
      countryOfEmployment = ?, lineManager = ?, currency = ?, frequency = ?, name = ?, image = ?, phone = ?,
      dob = ?, address = ?, bankName = ?, bankAccountNo = ?, ifscCode = ?, bankAddress = ?
      WHERE id = ?`;

    const [result] = await promisePool.query(sql, [
      firstname,
      lastName,
      email,
      office,
      Number(salary),
      role,
      status,
      position,
      team,
      Number(departmentId),
      joiningDate ? new Date(joiningDate).toISOString().split('T')[0] : null,
      inviteEmail === 'true' || inviteEmail === true ? 1 : 0,
      employmentType,
      countryOfEmployment,
      lineManager,
      currency,
      frequency,
      name,
      image,
      phone,
      dob ? new Date(dob).toISOString().split('T')[0] : null,
      address,
      bankName,
      bankAccountNo,
      ifscCode,
      bankAddress,
      id
    ]);

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update only employee status
app.put('/api/employees/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const [result] = await promisePool.query(
      'UPDATE employees SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating employee status:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Delete Employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    // Delete image file from disk if exists
    const [rows] = await promisePool.query('SELECT image FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length > 0 && rows[0].image) {
      const imagePath = rows[0].image.startsWith('/') ? rows[0].image.slice(1) : rows[0].image;
      const filePath = path.join(__dirname, imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await promisePool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --------------------- Leaves Routes ---------------------

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  return diffDays > 0 ? diffDays : 0;
}

function validateLeave(req, res, next) {
  const { employee_id, start_date, end_date, leave_type } = req.body;
  if (!employee_id || !start_date || !end_date || !leave_type) {
    return res.status(400).json({
      error: 'Missing required fields: employee_id, start_date, end_date, leave_type'
    });
  }
  next();
}

// Create Leave
app.post('/api/leaves', validateLeave, async (req, res) => {
  try {
    const { employee_id, start_date, end_date, status, reason, leave_type } = req.body;
    const duration = calculateDuration(start_date, end_date);

    const [result] = await promisePool.query(
      `INSERT INTO leaves (employee_id, start_date, end_date, status, reason, leave_type, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, start_date, end_date, status || 'pending', reason || null, leave_type, duration]
    );

    res.status(201).json({ message: 'Leave created', id: result.insertId });
  } catch (err) {
    console.error('Error creating leave:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get All Leaves
app.get('/api/leaves', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM leaves');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Leaves by Employee ID
app.get('/api/leaves/employee/:employee_id', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM leaves WHERE employee_id = ?', [req.params.employee_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Leave
app.put('/api/leaves/:id', async (req, res) => {
  try {
    let { start_date, end_date, status, reason, leave_type } = req.body;

    // If either start_date or end_date missing, fetch current values
    if (!start_date || !end_date) {
      const [rows] = await promisePool.query('SELECT start_date, end_date FROM leaves WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Leave not found' });

      if (!start_date) start_date = rows[0].start_date;
      if (!end_date) end_date = rows[0].end_date;
    }

    const duration = calculateDuration(start_date, end_date);

    await promisePool.query(
      `UPDATE leaves SET start_date = ?, end_date = ?, status = ?, reason = ?, leave_type = ?, duration = ? WHERE id = ?`,
      [start_date, end_date, status || 'pending', reason || null, leave_type, duration, req.params.id]
    );

    res.json({ message: 'Leave updated' });
  } catch (err) {
    console.error('Error updating leave:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete Leave
app.delete('/api/leaves/:id', async (req, res) => {
  try {
    await promisePool.query('DELETE FROM leaves WHERE id = ?', [req.params.id]);
    res.json({ message: 'Leave deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Leave Stats by Employee ID
app.get('/api/leaves/employee/:employee_id/stats', async (req, res) => {
  try {
    const employeeId = req.params.employee_id;

    const [rows] = await promisePool.query(
      `SELECT status, leave_type, duration 
       FROM leaves 
       WHERE employee_id = ?`,
      [employeeId]
    );

    let totalLeaves = 0;
    let leavesTaken = 0;
    let workFromHome = 0;

    rows.forEach(row => {
      totalLeaves += row.duration;

      if (row.status === 'Approved') {
        leavesTaken += row.duration;
      }

      if (row.leave_type.toLowerCase() === 'work from home') {
        workFromHome += row.duration;
      }
    });

    const leavesRemaining = totalLeaves - leavesTaken;

    res.json({
      totalLeaves,
      leavesTaken,
      leavesRemaining: leavesRemaining >= 0 ? leavesRemaining : 0,
      workFromHome
    });
  } catch (err) {
    console.error('Error fetching leave stats:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --------------------- Department Routes ---------------------

// Create Department
app.post('/api/department', (req, res) => {
  const { name, status = 'active', description = null } = req.body;
  const sql = 'INSERT INTO department (name, status, description) VALUES (?, ?, ?)';
  pool.query(sql, [name, status, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Department added', id: result.insertId });
  });
});

// Get All Departments
app.get('/api/department', (req, res) => {
  pool.query('SELECT * FROM department', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get Department by ID
app.get('/api/department/:id', (req, res) => {
  pool.query('SELECT * FROM department WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(result[0]);
  });
});

// Update Department
app.put('/api/department/:id', (req, res) => {
  const { name, status, description = null } = req.body;
  const sql = 'UPDATE department SET name = ?, status = ?, description = ? WHERE id = ?';
  pool.query(sql, [name, status, description, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department updated' });
  });
});

// Delete Department
app.delete('/api/department/:id', (req, res) => {
  const sql = 'DELETE FROM department WHERE id = ?';
  pool.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department deleted' });
  });
});

// --------------------- Global Error Handler ---------------------
app.use((err, req, res, next) => {
  console.error('Global Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --------------------- Teams Routes ---------------------
// Get all teams
app.get('/teams', async (req, res) => {
  try {
    const [results] = await promisePool.query('SELECT * FROM teams');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new team
app.post('/teams', async (req, res) => {
  try {
    const { name, status, memberIds } = req.body;

    const [result] = await promisePool.query(
      'INSERT INTO teams (name, status) VALUES (?, ?)',
      [name, status || 'Active']
    );

    const teamId = result.insertId;

    if (memberIds && memberIds.length > 0) {
      const teamMembersValues = memberIds.map(empId => [teamId, empId]);
      await promisePool.query(
        'INSERT INTO team_members (team_id, employee_id) VALUES ?',
        [teamMembersValues]
      );
    }

    res.json({ message: 'Team created with members' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update team status
 */
// Update team status
app.put('/teams/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE teams SET status=? WHERE id=?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/employees/:id/team', async (req, res) => {
  const employeeId = req.params.id;
  const { teamName } = req.body;

  try {
    // Update employees table
    await promisePool.query('UPDATE employees SET team = ? WHERE id = ?', [teamName, employeeId]);

    // Check if team exists
    const [teams] = await promisePool.query('SELECT id FROM teams WHERE name = ?', [teamName]);
    let teamId;
    if (teams.length === 0) {
      const [result] = await promisePool.query(
        'INSERT INTO teams (name, status) VALUES (?, ?)',
        [teamName, 'Active']
      );
      teamId = result.insertId;
    } else {
      teamId = teams[0].id;
    }

    // Add employee to team_members table if not exists
    await promisePool.query(
      'INSERT IGNORE INTO team_members (team_id, employee_id) VALUES (?, ?)',
      [teamId, employeeId]
    );

    res.json({ message: 'Team updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /teams/:id
app.put('/teams/:id', async (req, res) => {
  const { id } = req.params;
  const { name, status, members } = req.body; // members = array of employee IDs

  try {
    // Update team info
    await pool.query('UPDATE teams SET name = ?, status = ? WHERE id = ?', [name, status, id]);

    // Delete existing members
    await pool.query('DELETE FROM team_members WHERE team_id = ?', [id]);

    // Insert new members
    if (members && members.length > 0) {
      const values = members.map(empId => [id, empId]);
      await pool.query('INSERT INTO team_members (team_id, employee_id) VALUES ?', [values]);
    }

    res.json({ message: 'Team updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update team' });
  }
});

/**
 * Delete team
 */
// Node/Express example
// DELETE /teams/:id
// DELETE a team by ID
// DELETE /teams/:id
app.delete('/teams/:id', (req, res) => {
  const teamId = req.params.id;

  // First delete any team-member relations (if using a separate table)
  const sqlMembers = 'DELETE FROM team_members WHERE team_id = ?';
  db.query(sqlMembers, [teamId], (err) => {
    if (err) {
      console.error('Failed to delete team members:', err);
      return res.status(500).json({ message: 'Failed to delete team members' });
    }

    // Then delete the team
    const sqlTeam = 'DELETE FROM teams WHERE id = ?';
    db.query(sqlTeam, [teamId], (err2, result) => {
      if (err2) {
        console.error('Failed to delete team:', err2);
        return res.status(500).json({ message: 'Failed to delete team' });
      }

      return res.json({ message: 'Team deleted successfully' });
    });
  });
});
// --------------------- Teams Routes ---------------------

// --------------------- Chats Start ---------------------
// CREATE - Add employee
app.post("/api/employees", validateEmployeeFields, (req, res) => {
  let {
    name,
    office,
    email,
    salary,
    role,
    status,
    firstname,
    lastName,
    position,
    team,
    departmentId,
    joiningDate,
    inviteEmail,
    employmentType,
    countryOfEmployment,
    lineManager,
    currency,
    frequency,
  } = req.body;

  name = name || `${firstname} ${lastName}`;
  departmentId = departmentId || 1;

  const sql = `INSERT INTO employees 
    (name, office, email, salary, role, status, firstname, lastName, position, team, departmentId, joiningDate,
     inviteEmail, employmentType, countryOfEmployment, lineManager, currency, frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  pool.query(
    sql,
    [
      name,
      office,
      email,
      salary,
      role,
      status,
      firstname,
      lastName,
      position,
      team,
      departmentId,
      joiningDate,
      inviteEmail ?? false,
      employmentType,
      countryOfEmployment,
      lineManager,
      currency,
      frequency,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting employee:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Employee added", id: result.insertId });
    }
  );
});

// GET all messages with user info
// GET all messages with user info (no isRead column)
app.get("/api/chat/messages/all", async (req, res) => {
  try {
    const [messages] = await promisePool.query(
      `SELECT 
        m.id, 
        m.from, 
        m.to, 
        m.content, 
        m.timestamp,
        e1.firstname AS from_firstname, 
        e1.lastName AS from_lastname,
        e2.firstname AS to_firstname, 
        e2.lastName AS to_lastname
      FROM messages m
      JOIN employees e1 ON m.from = e1.id
      JOIN employees e2 ON m.to = e2.id
      ORDER BY m.timestamp DESC`
    );

    res.json(messages);
  } catch (err) {
    console.error("Error fetching all messages:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/chat/messages", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res
      .status(400)
      .json({ error: "Missing 'from' or 'to' query parameters" });
  }

  try {
    const [messages] = await promisePool.query(
      `SELECT 
        m.id,
        m.from,
        m.to,
        m.content,
        m.timestamp,
        e1.firstname AS from_firstname,
        e1.lastName AS from_lastname,
        e2.firstname AS to_firstname,
        e2.lastName AS to_lastname
      FROM messages m
      JOIN employees e1 ON m.from = e1.id
      JOIN employees e2 ON m.to = e2.id
      WHERE (m.from = ? AND m.to = ?) OR (m.from = ? AND m.to = ?)
      ORDER BY m.timestamp ASC`,
      [from, to, to, from]
    );

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// Send a new message
app.post("/api/chat/messages", async (req, res) => {
  const { from, to, content } = req.body;

  // Basic validation
  if (!from || !to || !content) {
    return res
      .status(400)
      .json({ error: "Missing 'from', 'to', or 'content' in request body" });
  }

  try {
    // 1. Insert message into messages table
    const [result] = await promisePool.query(
      `INSERT INTO messages (\`from\`, \`to\`, content, timestamp, read_status) 
       VALUES (?, ?, ?, NOW(), 0)`, // 0 = sent
      [from, to, content]
    );

    const now = new Date();

    // 2. Update lastMessage & lastMessageTime for BOTH sender and receiver
    await promisePool.query(
      `UPDATE employees 
       SET lastMessage = ?, lastMessageTime = ? 
       WHERE id IN (?, ?)`,
      [content, now, from, to]
    );

    // 3. Send response back
    res.json({
      success: true,
      message: "Message sent successfully",
      messageId: result.insertId,
      data: {
        id: result.insertId,
        from,
        to,
        content,
        timestamp: now,
        read_status: 0,
      },
    });
  } catch (err) {
    console.error("Error inserting message:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// app.put("/api/chat/messages/:id/seen", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [result] = await promisePool.query(
//       `UPDATE messages
//        SET read_status = 2  -- 2 = seen
//        WHERE id = ?`,
//       [id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Message not found" });
//     }

//     res.json({ success: true, message: "Message marked as seen" });
//   } catch (err) {
//     console.error("Error updating message status:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// Delete entire conversation between 2 users
app.put("/api/chat/messages/:id/seen", async (req, res) => {
  try {
    const [result] = await promisePool.query(
      "UPDATE messages SET read_status = 2 WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Message not found" });
    res.json({ success: true, message: "Message marked as seen" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/chat/conversation/:userId/:employeeId", async (req, res) => {
  const { userId, employeeId } = req.params;

  try {
    const [result] = await promisePool.query(
      `DELETE FROM messages
       WHERE (\`from\` = ? AND \`to\` = ?)
          OR (\`from\` = ? AND \`to\` = ?)`,
      [userId, employeeId, employeeId, userId]
    );

    res.json({
      success: true,
      message: "Conversation deleted successfully",
      deletedCount: result.affectedRows,
    });
  } catch (err) {
    console.error("Error deleting conversation:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// Delete single message by ID
app.delete("/api/chat/messages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await promisePool.query(
      "DELETE FROM messages WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// Block employee
app.put("/api/employees/:id/block", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await promisePool.query(
      `UPDATE employees SET isBlocked = 1 WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "User blocked successfully" });
  } catch (err) {
    console.error("Error blocking user:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// Clear messages with a user
app.delete("/api/chat/messages/:id", async (req, res) => {
  const messageId = req.params.id;

  try {
    const [result] = await db.query("DELETE FROM messages WHERE id = ?", [messageId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete chat (same as clear for now, can archive instead)
app.delete("/api/chat/delete/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    await promisePool.query(
      `DELETE FROM messages WHERE from_user = ? OR to_user = ?`,
      [userId, userId]
    );
    res.json({ success: true, message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Block / Unblock user
app.put("/api/employees/:id/block", async (req, res) => {
  await promisePool.query(`UPDATE employees SET isBlocked = 1 WHERE id = ?`, [
    req.params.id,
  ]);
  res.json({ success: true, message: "User blocked" });
});

app.put("/api/employees/:id/unblock", async (req, res) => {
  await promisePool.query(`UPDATE employees SET isBlocked = 0 WHERE id = ?`, [
    req.params.id,
  ]);
  res.json({ success: true, message: "User unblocked" });
});

// ✅ Delete message by ID
// Async function required for await
app.delete("/api/chat/messages/:id", async (req, res) => {
  const messageId = req.params.id;

  try {
    // Using promise pool correctly
    const [result] = await db.query("DELETE FROM messages WHERE id = ?", [messageId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Database error" });
  }
});
//-------------------------- Chats End ---------------------// 

//-----------------------Notes Routes ---------------------

// ✅ Get active notes
app.get("/api/notes", (req, res) => {
  pool.query(
    "SELECT * FROM notes WHERE is_deleted = 0 ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// ✅ Add note
app.post("/api/notes", (req, res) => {
  const { title, assignee, tag, priority, due_date, status, description } = req.body;
  const sql = `INSERT INTO notes (title, assignee, tag, priority, due_date, status, description, is_deleted) 
               VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;
  pool.query(
    sql,
    [title, assignee, tag, priority, due_date, status, description],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Note added successfully", id: result.insertId });
    }
  );
});

// ✅ Move note to trash
app.put("/api/notes/:id/trash", (req, res) => {
  const sql = "UPDATE notes SET is_deleted = 1 WHERE id = ?";
  pool.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Note moved to trash successfully" });
  });
});

// ✅ Get trash notes
app.get("/api/notes/trash", (req, res) => {
  pool.query(
    "SELECT * FROM notes WHERE is_deleted = 1 ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// ✅ Permanent delete
app.delete("/api/notes/:id", (req, res) => {
  pool.query("DELETE FROM notes WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Note permanently deleted" });
  });
});

//-----------------------Notes Routes End ---------------------

// --------------------- Employee Documents Routes ---------------------

app.get('/api/employees/:id/documents', async (req, res) => {
  const { id } = req.params;
  try {
    const [docs] = await promisePool.query(
      'SELECT * FROM employee_details WHERE employeeId = ?',
      [id]
    );

    // Safely map filePath to URL
    const docsWithPath = docs.map(doc => {
      let fileName = '';
      if (doc.filePath) {
        fileName = doc.filePath.includes('\\') 
          ? doc.filePath.split('\\').pop() 
          : doc.filePath.split('/').pop();
      }
      return {
        ...doc,
        filePath: `/uploads/${fileName}`  // this will match your express.static('/uploads')
      };
    });

    res.json(docsWithPath);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Serve uploads folder
app.use('/uploads', express.static('uploads'));

app.post('/api/employees/:employeeId/documents', upload.single('file'), async (req, res) => {
  try {
    console.log('--- Upload Request Received ---');
    console.log('Params:', req.params);   // employeeId
    console.log('Body:', req.body);       // name, date
    console.log('File:', req.file);       // multer file object

    if (!req.file) {
      console.error('No file uploaded. Did you use form-data with key "file"?');
      return res.status(400).json({ 
        error: 'No file uploaded. Make sure key is "file" and form-data is used.' 
      });
    }

    const { name, date } = req.body;
    const type = req.file.mimetype;           // MIME type
    const size = req.file.size.toString();    // Convert size to string to match DB column
    const filePath = '/uploads/' + req.file.filename; // web-accessible path

    // Insert into employee_details table
    const [result] = await promisePool.query(
      `INSERT INTO employee_details 
       (employeeId, name, type, date, size, filePath) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.employeeId, name, type, date || new Date(), size, filePath]
    );

    console.log('Inserted document ID:', result.insertId);

    res.json({
      id: result.insertId,
      employeeId: req.params.employeeId,
      name,
      type,
      date: date || new Date(),
      size,
      filePath
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// 🔹 Update document details
app.put('/api/employees/documents/:id', upload.single('file'), async (req, res) => {
  try {
    const { name, date } = req.body;
    let sql = 'UPDATE employee_details SET name=?, date=?';
    const params = [name, date];

    if (req.file) {
      sql += ', filePath=?';
      params.push(req.file.path);
    }

    sql += ' WHERE id=?';
    params.push(req.params.id);

    await promisePool.query(sql, params);

    res.json({
      id: req.params.id,
      name,
      date,
      filePath: req.file ? req.file.path : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update document' });
  }
});
// 🔹 Delete document
app.delete('/api/employees/documents/:id', async (req, res) => {
  try {
    await promisePool.query('DELETE FROM employee_details WHERE id=?', [req.params.id]);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

//----------------------------------------
// ---------------- Salary Routes ----------------

// Get all salaries
app.get('/api/salary', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM salary ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get salary for a specific employee
app.get('/api/employee/:id/salary', async (req, res) => {
  const employeeId = req.params.id;
  try {
    const [rows] = await db.query(
      'SELECT * FROM salary WHERE employee_id = ? ORDER BY created_at DESC',
      [employeeId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add salary
app.post('/api/salary', (req, res) => {
  console.log('Received body:', req.body); // log for debugging

  const { employee_id, basic, hra, total, status, date } = req.body;

  const sql = `INSERT INTO salary (employee_id, basic, hra, total, status, date)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [employee_id, basic, hra, total, status, date], (err, result) => {
    if (err) {
      console.error('Error inserting salary:', err);
      return res.status(500).json({ success: false, message: 'DB insert failed' });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// Update salary
app.put('/api/salary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, basic, hra, total, status, date } = req.body;
    await db.query(
      `UPDATE salary SET employee_id=?, basic=?, hra=?, total=?, status=?, date=? WHERE id=?`,
      [employee_id, basic, hra, total, status, date, id]
    );
    res.json({ id, employee_id, basic, hra, total, status, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete salary
app.delete('/api/salary/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Deleting salary with id:', id);
  try {
    const [result] = await db.query('DELETE FROM salary WHERE id = ?', [Number(id)]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Salary not found' });
    }
    res.json({ message: 'Salary deleted successfully' });
  } catch (err) {
    console.error('Error deleting salary:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update salary status only
app.put('/api/salary/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query('UPDATE salary SET status = ? WHERE id = ?', [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Salary status updated' });
  });
});

// -------------------- API Routes --------------------

// Get all leave types
app.get('/api/leave-types', (req, res) => {
  db.query('SELECT * FROM leave_types ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Add new leave type
app.post('/api/leave-types', (req, res) => {
  const { name, status } = req.body;
  if (!name) return res.status(400).json({ message: 'Leave type name is required' });

  const query = 'INSERT INTO leave_types (name, status) VALUES (?, ?)';
  db.query(query, [name, status || 'Active'], (err, result) => {
    if (err) return res.status(500).json(err);
    // Return the inserted row
    db.query('SELECT * FROM leave_types WHERE id = ?', [result.insertId], (err2, rows) => {
      if (err2) return res.status(500).json(err2);
      res.json(rows[0]);
    });
  });
});

// Update leave type
app.put('/api/leave-types/:id', (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  const query = 'UPDATE leave_types SET name = ?, status = ? WHERE id = ?';
  db.query(query, [name, status || 'Active', id], (err) => {
    if (err) return res.status(500).json(err);
    db.query('SELECT * FROM leave_types WHERE id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).json(err2);
      res.json(rows[0]);
    });
  });
});

// Delete leave type
app.delete('/api/leave-types/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM leave_types WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Leave type deleted successfully' });
  });
});


//-------------------manage-------------------------------


// ----------------------
// ROLES API
// ----------------------

// Get all roles with members
// Get all roles with members
app.get("/api/roles", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.id, r.roleName,
             u.id AS member_id, u.name AS member_name, u.avatarUrl
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id
    `);

    const rolesMap = {};
    rows.forEach(row => {
      if (!rolesMap[row.id]) {
        rolesMap[row.id] = { id: row.id, roleName: row.roleName, members: [] };
      }
      if (row.member_id) {
        rolesMap[row.id].members.push({
          id: row.member_id,
          name: row.member_name,
          avatarUrl: row.avatarUrl
        });
      }
    });

    res.json(Object.values(rolesMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add role
app.post("/api/roles", async (req, res) => {
  const { roleName } = req.body;
  if (!roleName) return res.status(400).json({ error: "roleName is required" });

  try {
    const [result] = await db.query("INSERT INTO roles (roleName) VALUES (?)", [roleName]);
    res.json({ id: result.insertId, roleName, members: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update role
app.put("/api/roles/:id", async (req, res) => {
  const { id } = req.params;
  const { roleName } = req.body;

  try {
    const [result] = await db.query("UPDATE roles SET roleName = ? WHERE id = ?", [roleName, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Role not found" });
    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete role
app.delete("/api/roles/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM roles WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Role not found" });
    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/upload", upload.single("avatar"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // Return file URL (so you can save in DB later)
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});
// ----------------------
// USERS API
// ----------------------

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ error: err.sqlMessage });
  }
});

// Get single user by id
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  });
});

// Add new user
app.post("/api/users", async (req, res) => {
  const { name, email, role_id, avatarUrl } = req.body;

  if (!name || !email || !role_id) {
    return res.status(400).json({ error: "Name, Email and Role are required" });
  }

  const sql = "INSERT INTO users (name, email, role_id, avatarUrl) VALUES (?, ?, ?, ?)";
  try {
    const [result] = await db.query(sql, [name, email, role_id, avatarUrl || null]);
    res.json({ id: result.insertId, name, email, role_id, avatarUrl: avatarUrl || null });
  } catch (err) {
    console.error("Insert User Error:", err);
    res.status(500).json({ error: err.sqlMessage });
  }
});

// Update user
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, avatarUrl, role_id } = req.body;

  db.query("UPDATE users SET name = ?, avatarUrl = ?, role_id = ? WHERE id = ?", 
    [name, avatarUrl, role_id, id], 
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User updated successfully" });
    }
  );
});

// Delete user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  });
});


//--------------------- API Routes End --------------------
// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
