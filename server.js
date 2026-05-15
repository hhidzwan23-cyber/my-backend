const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://sulaimanhadza:hidzwan23@cyber23-portfolio.voyckc0.mongodb.net/mytasks?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Connection error:', err));
const taskSchema = new mongoose.Schema({
  task: String
});

const Task = mongoose.model('Task', taskSchema);

app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const newTask = new Task({ task: req.body.task });
  await newTask.save();
  res.json({ message: 'Task saved', task: newTask });
});

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted' });
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});