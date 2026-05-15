const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./User');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://sulaimanhadza:hidzwan23@cyber23-portfolio.voyckc0.mongodb.net/mytasks?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Connection error:', err));

const taskSchema = new mongoose.Schema({
  task: String,
  userId: String
});

const Task = mongoose.model('Task', taskSchema);

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.json({ message: 'User registered successfully' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'User not found' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ message: 'Wrong password' });
  const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});

app.get('/tasks', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, 'secretkey');
    const tasks = await Task.find({ userId: decoded.userId });
    res.json(tasks);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, 'secretkey');
    const newTask = new Task({ task: req.body.task, userId: decoded.userId });
    await newTask.save();
    res.json({ message: 'Task saved', task: newTask });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});