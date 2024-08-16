const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating tokens

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'users'
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Sign Up 
app.post('/signup', (req, res) => {
  const { fullName, email, mobileNumber, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash password
  
  const query = 'INSERT INTO users (fullName, email, mobileNumber, password) VALUES (?, ?, ?, ?)';
  db.query(query, [fullName, email, mobileNumber, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error saving data:', err);
      res.status(500).send({ message: 'Error saving data' });
    } else {
      res.status(200).send({ message: 'User registered successfully' });
    }
  });
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      res.status(500).send({ message: 'Database query failed' });
    } else if (results.length === 0) {
      res.status(401).send({ message: 'User not found' });
    } else {
      const user = results[0];
      if (bcrypt.compareSync(password, user.password)) {
        // Create a token
        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).send({ 
          message: 'Login successful', 
          token, 
          userId: user.id 
        });
      } else {
        res.status(401).send({ message: 'Invalid credentials' });
      }
    }
  });
});


// Add Todo 
app.post('/add-todo', (req, res) => {
  const { title, description, date, time, userId } = req.body;


  if (!title || !description || !date || !time || !userId) {
    return res.status(400).send('Missing required fields');
  }


  const due_date = `${date} ${time}`;

  const query = 'INSERT INTO todos (title, description, due_date, userId) VALUES (?, ?, ?, ?)';
  db.query(query, [title, description, due_date, userId], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).send('Internal Server Error');
    }
    res.status(200).send('Todo added successfully');
  });
});

// show Todos 
app.get('/todos/:userId', (req, res) => {
  const userId = req.params.userId;


  if (!userId || !/^\d+$/.test(userId)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }


  const query = 'SELECT * FROM todos WHERE userId = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching todos:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'No todos found for this user' });
    }
    

    res.status(200).json(results);
  });
});

    // Home serchbar bellow todo list
    app.get('/todos/:userId', (req, res) => {
      const userId = req.params.userId;
      
      console.log('Received userId:', userId); // Log the userId received
    
   
      if (!userId || !/^\d+$/.test(userId)) {
        return res.status(400).json({ message: 'Invalid userId format' });
      }
      
 
      const query = `
        SELECT * FROM todos 
        WHERE userId = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error('Error fetching todos:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ message: 'No todos found for this user' });
        }
        
        
        res.status(200).json(results);
      });
    });
    
    // Delete todos
    app.delete('/todos/:userId/:todoId', (req, res) => {
      const { userId, todoId } = req.params;
    
      
      if (!userId || !/^\d+$/.test(userId) || !todoId || !/^\d+$/.test(todoId)) {
        return res.status(400).json({ message: 'Invalid parameters' });
      }
    
    
      const query = 'DELETE FROM todos WHERE userId = ? AND id = ?';
    
      db.query(query, [userId, todoId], (err, results) => {
        if (err) {
          console.error('Error deleting todo:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
    
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Todo not found' });
        }
    
        res.status(200).json({ message: 'Todo deleted successfully' });
      });
    });

   

    
// Fetch User by ID Endpoint
app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).send({ message: 'Error fetching user' });
    } else if (results.length === 0) {
      res.status(404).send({ message: 'User not found' });
    } else {
      res.status(200).send(results[0]);
    }
  });
});

// Update User details
app.put('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  const { fullName, email, mobileNumber, password } = req.body;


  let query = 'UPDATE users SET fullName = ?, email = ?, mobileNumber = ?';
  const values = [fullName, email, mobileNumber];


  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10); // Hash the new password
    query += ', password = ?';
    values.push(hashedPassword);
  }

  query += ' WHERE id = ?';
  values.push(userId);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating user details:', err); // Log detailed error
      res.status(500).send({ message: 'Error updating user details', error: err }); // Include error in response
    } else {
      res.status(200).send({ message: 'User details updated successfully' });
    }
  });
});


// Show a specific TODO item for a user
app.get('/todos/:userId/:todoId', (req, res) => {
  const { userId, todoId } = req.params;


  if (!userId || !/^\d+$/.test(userId) || !todoId || !/^\d+$/.test(todoId)) {
    return res.status(400).json({ message: 'Invalid parameters' });
  }

  
  const query = 'SELECT * FROM todos WHERE userId = ? AND id = ?';
  db.query(query, [userId, todoId], (err, results) => {
    if (err) {
      console.error('Error fetching todo:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json(results[0]);
  });
});


// Get TODO items acording to calender 
app.get('/todos/:userId/date/:date', (req, res) => {
  const { userId, date } = req.params;

  const query = `
    SELECT * FROM todos
    WHERE userId = ? AND DATE(due_date) = ?;
  `;

  db.query(query, [userId, date], (err, results) => {
    if (err) {
      console.error('Error fetching TODO items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
