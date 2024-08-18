const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Todo = require('./models/todo');

const app = express();
app.use(express.json());



// Replace with your MongoDB connection string
const mongoUri = 'mongodb://localhost:27017/users';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Database connection failed:', err));


// Sign Up
app.post('/signup', async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already in use.' });
    }

    const newUser = new User({ fullName, email, mobileNumber, password: hashedPassword });
    await newUser.save();

    res.status(200).send({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error code
      res.status(400).send({ message: 'Email already in use.' });
    } else {
      console.error('Error saving data:', err);
      res.status(500).send({ message: 'Error saving data' });
    }
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

    // Parse the date parameter into a UTC Date object
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    // Set start and end of the day in UTC
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


app.get('/todos/:userId/:todoId', async (req, res) => {
    const { userId, todoId } = req.params;
  
    try {
      const todo = await Todo.findOne({ _id: todoId, userId });
  
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
  
      res.json(todo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });



// Show a specific TODO item for a user
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
