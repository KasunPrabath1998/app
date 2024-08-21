require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('./models/user');
const Todo = require('./models/todo');

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Database connection failed:', err));

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send Verification Email
const sendVerificationEmail = (user, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking on the following link: \n\n${process.env.FRONTEND_URL}/verify-email?token=${token}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Signup Endpoint
app.post('/signup', async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = new User({
      fullName,
      email,
      mobileNumber,
      password: hashedPassword,
      verificationToken
    });
    await newUser.save();

    sendVerificationEmail(newUser, verificationToken);

    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'Error during signup' });
  }
});

// Verify Email Endpoint
app.get('/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
  
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>TodoApp</title>
              <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f9fa; }
                  .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                  h1 { color: #dc3545; }
                  p { font-size: 18px; color: #6c757d; }
                  a { color: #007bff; text-decoration: none; }
                  a:hover { text-decoration: underline; }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>Your email has already been verified</h1>
                 <p>The email associated with this account has already been verified. If you're experiencing issues or need further assistance, please try logging in or contact our support team for help.</p>
                
              </div>
          </body>
          </html>
        `);
      }
  
      user.verified = true;
      user.verificationToken = undefined; // Clear the token
      await user.save();
  
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TodoApp</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f9fa; }
                .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                h1 { color: #28a745; }
                p { font-size: 18px; color: #6c757d; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Email Verified Successfully!</h1>
                <p>Your email has been successfully verified. You can now log in to your account.</p>
              
            </div>
        </body>
        </html>
      `);
    } catch (err) {
      console.error('Error during email verification:', err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Error</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f9fa; }
                .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                h1 { color: #dc3545; }
                p { font-size: 18px; color: #6c757d; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Internal Server Error</h1>
                <p>There was an issue processing your request. Please try again later.</p>
             
            </div>
        </body>
        </html>
      `);
    }
  });
  

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ message: 'User not found' });
        }

        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
            res.status(200).send({ message: 'Login successful', token, userId: user._id });
        } else {
            res.status(401).send({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


// Add Todo
app.post('/add-todo', async (req, res) => {
  try {
      const { title, description, date, time, userId } = req.body;

      // Validate required fields
      if (!title || !description || !date || !time || !userId) {
          return res.status(400).json({ message: 'Missing required fields' });
      }

      // Combine date and time into a single Date object
      const due_date = new Date(`${date}T${time}`); // Ensures the correct format (ISO string)

      // Validate the date
      if (isNaN(due_date.getTime())) { // Check if the date is invalid
          return res.status(400).json({ message: 'Invalid date or time format' });
      }

      // Create and save the new Todo
      const newTodo = new Todo({
          title,
          description,
          due_date,
          userId
      });
      await newTodo.save();

      res.status(201).json({ message: 'Todo added successfully', todo: newTodo });
  } catch (error) {
      console.error('Error adding todo:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Show Todos under serch bar home 
app.get('/todos/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid userId format');
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        console.log('Fetching todos for userId:', userId);

        const todos = await Todo.find({ userId });

        if (todos.length === 0) {
            console.log('No todos found for this user');
            return res.status(404).json({ message: 'No todos found for this user' });
        }

        res.status(200).json(todos);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// Calender

app.get('/todos/:userId/date/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    // Parse the date parameter 
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    // Set start and end of the day 
    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Query for todos
    const todos = await Todo.find({
      userId: userId,
      due_date: { $gte: startOfDay, $lt: endOfDay }
    });

    if (todos.length === 0) {
      return res.status(404).json({ message: 'No task found for this date' });
    }

    res.status(200).json(todos);
  } catch (err) {
    console.error('Error fetching TODO items:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Show a specific TODO item for todolist
app.get('/todos/:userId/:todoId', async (req, res) => {
  try {
      const { userId, todoId } = req.params;

      console.log('Received userId:', userId);
      console.log('Received todoId:', todoId);

      // Check if IDs are valid ObjectId instances
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(todoId)) {
          console.log('Invalid parameters');
          return res.status(400).json({ message: 'Invalid parameters' });
      }

      // Use new mongoose.Types.ObjectId() to create ObjectId instances
      const todo = await Todo.findOne({ 
          _id: new mongoose.Types.ObjectId(todoId), 
          userId: new mongoose.Types.ObjectId(userId) 
      });

      if (!todo) {
          console.log('Todo not found');
          return res.status(404).json({ message: 'Todo not found' });
      }

      
      res.status(200).json(todo);
  } catch (err) {
      console.error('Error fetching todo:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Delete Todo since home page
app.delete('/todos/:userId/:todoId', async (req, res) => {
    try {
        const { userId, todoId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(todoId)) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }

        const result = await Todo.deleteOne({ _id: todoId, userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Update Todo in all todo list dtails page
app.put('/todos/:userId/:todoId', async (req, res) => {
  try {
      const { userId, todoId } = req.params;
      const { title, description, date, time } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(todoId)) {
          return res.status(400).json({ message: 'Invalid parameters' });
      }

      const updatedTodo = await Todo.findOneAndUpdate(
          { _id: todoId, userId: userId },
          { title, description, date, time },
          { new: true }
      );

      if (!updatedTodo) {
          return res.status(404).json({ message: 'Todo not found' });
      }

      res.status(200).json({ message: 'Todo updated successfully', todo: updatedTodo });
  } catch (err) {
      console.error('Error updating todo:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete Todo in all todo list dtails page
app.delete('/todos/:userId/:todoId', async (req, res) => {
  try {
      const { userId, todoId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(todoId)) {
          return res.status(400).json({ message: 'Invalid parameters' });
      }

      const result = await Todo.deleteOne({ _id: todoId, userId });

      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Todo not found' });
      }

      res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (err) {
      console.error('Error deleting todo:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Fetch User by ID
app.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send({ message: 'Error fetching user' });
    }
});

// Update User details
app.put('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, mobileNumber, password } = req.body;

        let updateData = { fullName, email, mobileNumber };

        if (password) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            updateData.password = hashedPassword;
        }

        const result = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!result) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send({ message: 'User details updated successfully' });
    } catch (err) {
        console.error('Error updating user details:', err);
        res.status(500).send({ message: 'Error updating user details', error: err });
    }
});


// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON' });
    }
    next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});