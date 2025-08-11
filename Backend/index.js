const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');


// Create connection pool and wrap it with promise support
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
promisePool.query('DESCRIBE leaves').then(([rows]) => {
  console.log('Leaves table columns:', rows);
}).catch(console.error);


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Test DB connection
pool.getConnection((err, conn) => {
  if (err) {
    console.error('MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL');
  conn.release();
});


const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG files are allowed'), false);
    }
  }
});


// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend' });
});

// Validate required fields middleware
function validateEmployeeFields(req, res, next) {
  const body = req.body;
  const firstname = body.firstname || body.firstName;
  const lastName = body.lastName || body.lastname;
  const email = body.email;

  if (!firstname || !lastName || !email) {
    return res.status(400).json({
      error: 'Missing required fields: firstname, lastName, email'
    });
  }

  req.body.firstname = firstname;
  req.body.lastName = lastName;
  next();
}

// CREATE - Add employee
app.post('/api/employees', validateEmployeeFields, (req, res) => {
  let {
    name, office, email, salary, role, status,
    firstname, lastName, position, team, departmentId, joiningDate,
    inviteEmail, employmentType, countryOfEmployment, lineManager, currency, frequency
  } = req.body;

  name = name || `${firstname} ${lastName}`;
  departmentId = departmentId || 1;

  const sql = `INSERT INTO employees 
    (name, office, email, salary, role, status, firstname, lastName, position, team, departmentId, joiningDate,
     inviteEmail, employmentType, countryOfEmployment, lineManager, currency, frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  pool.query(sql, [
    name, office, email, salary, role, status,
    firstname, lastName, position, team, departmentId, joiningDate,
    inviteEmail ?? false, employmentType, countryOfEmployment, lineManager, currency, frequency
  ], (err, result) => {
    if (err) {
      console.error('Error inserting employee:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Employee added', id: result.insertId });
  });
});

// READ - All employees
app.get('/api/employees', (req, res) => {
  pool.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// READ - Single employee by ID
app.get('/api/employees/:id', (req, res) => {
  pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching employee:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result[0]);
  });
});

// UPDATE - Employee by ID
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  console.log('Received PUT for employee:', id);
  console.log('Data:', updated);

  const {
    name, office, email, salary, role, status,
    firstname, lastName, position, team, departmentId, joiningDate,
    inviteEmail, employmentType, countryOfEmployment, lineManager, currency, frequency
  } = updated;

  const sql = `UPDATE employees SET
    name = ?, office = ?, email = ?, salary = ?, role = ?, status = ?,
    firstname = ?, lastName = ?, position = ?, team = ?, departmentId = ?, joiningDate = ?,
    inviteEmail = ?, employmentType = ?, countryOfEmployment = ?, lineManager = ?, currency = ?, frequency = ?
    WHERE id = ?`;

  pool.query(sql, [
    name || `${firstname} ${lastName}`, office, email, salary, role, status,
    firstname, lastName, position, team, departmentId, joiningDate,
    inviteEmail ?? false, employmentType, countryOfEmployment, lineManager, currency, frequency,
    id
  ], (err, result) => {
    if (err) {
      console.error('Error updating employee:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      console.warn('No employee updated. ID not found:', id);
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee updated successfully' });
  });
});

// DELETE - Employee by ID
app.delete('/api/employees/:id', (req, res) => {
  pool.query('DELETE FROM employees WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting employee:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Employee deleted' });
  });
});

// leaves backend----------------------------------------------------------------------

// Validation middleware for leave requests
// Helper function to calculate duration in days
function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  return diffDays > 0 ? diffDays : 0;
}

// Validation middleware for leave requests
function validateLeave(req, res, next) {
  const { employee_id, start_date, end_date, leave_type } = req.body;
  if (!employee_id || !start_date || !end_date || !leave_type) {
    return res.status(400).json({
      error: 'Missing required fields: employee_id, start_date, end_date, leave_type'
    });
  }
  next();
}

// CREATE leave
app.post('/api/leaves', validateLeave, async (req, res) => {
  const { employee_id, start_date, end_date, status, reason, leave_type } = req.body;
  const duration = calculateDuration(start_date, end_date);

  try {
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

// READ all leaves
app.get('/api/leaves', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM leaves');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching leaves:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// READ leave by employee_id
app.get('/api/leaves/employee/:employee_id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM leaves WHERE employee_id = ?',
      [req.params.employee_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching employee leaves:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE leave
app.put('/api/leaves/:id', async (req, res) => {
  const { start_date, end_date, status, reason, leave_type } = req.body;
  const duration = (start_date && end_date) ? calculateDuration(start_date, end_date) : null;

  try {
    // If duration is null (because start_date or end_date not updated), fetch current dates from DB
    let finalStartDate = start_date;
    let finalEndDate = end_date;
    let finalDuration = duration;

    if (!start_date || !end_date) {
      const [rows] = await promisePool.query('SELECT start_date, end_date FROM leaves WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Leave not found' });
      }
      if (!start_date) finalStartDate = rows[0].start_date;
      if (!end_date) finalEndDate = rows[0].end_date;
      finalDuration = calculateDuration(finalStartDate, finalEndDate);
    }

    await promisePool.query(
      `UPDATE leaves SET start_date = ?, end_date = ?, status = ?, reason = ?, leave_type = ?, duration = ? WHERE id = ?`,
      [finalStartDate, finalEndDate, status || 'pending', reason || null, leave_type, finalDuration, req.params.id]
    );
    res.json({ message: 'Leave updated' });
  } catch (err) {
    console.error('Error updating leave:', err.message);
    res.status(500).json({ error: err.message });
  }
});
// DELETE leave
app.delete('/api/leaves/:id', async (req, res) => {
  try {
    await promisePool.query('DELETE FROM leaves WHERE id = ?', [req.params.id]);
    res.json({ message: 'Leave deleted' });
  } catch (err) {
    console.error('Error deleting leave:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});


//department
app.post('/api/department', (req, res) => {
  const { name, status } = req.body;
  const sql = 'INSERT INTO department (name, status) VALUES (?, ?)';
  pool.query(sql, [name, status || 'active'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Department added', id: result.insertId });
  });
});

// ✅ READ - Get all departments
app.get('/api/department', (req, res) => {
  pool.query('SELECT * FROM department', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ READ - Get department by ID
app.get('/api/department/:id', (req, res) => {
  pool.query('SELECT * FROM department WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(result[0]);
  });
});

// ✅ UPDATE - Update department
app.put('/api/department/:id', (req, res) => {
  const { name, status } = req.body;
  const sql = 'UPDATE department SET name = ?, status = ? WHERE id = ?';
  pool.query(sql, [name, status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department updated' });
  });
});

// ✅ DELETE - Delete department
app.delete('/api/department/:id', (req, res) => {
  const sql = 'DELETE FROM department WHERE id = ?';
  pool.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department deleted' });
  });
});

app.post('/api/department', (req, res) => {
  const { name, status, description } = req.body;
  const sql = 'INSERT INTO department (name, status, description) VALUES (?, ?, ?)';
  pool.query(sql, [name, status, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department added successfully', id: result.insertId });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
