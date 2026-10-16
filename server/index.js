require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Project = require('./models/Project');
const ProjectMembership = require('./models/ProjectMembership');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Auth Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    if (!f_name || !l_name || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const user = await User.create({ f_name, l_name, username, password });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        f_name: user.f_name,
        l_name: user.l_name,
        username: user.username
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Username does not exist' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Project Routes
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, status, project_lead_id } = req.body;

    if (!name || !description || !status || !project_lead_id) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const leadUser = await User.findById(project_lead_id);
    if (!leadUser) {
      return res.status(404).json({ message: 'Project lead does not exist' });
    }

    const project = await Project.create({ name, description, status, project_lead_id });
    
    // Automatically add lead to the project members
    await ProjectMembership.create({ project_id: project._id, user_id: project_lead_id });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    // Populate lead details so the frontend can display name instead of ID
    const projects = await Project.find().populate('project_lead_id', 'f_name l_name username');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Membership Routes
app.get('/api/projects/:projectId/members', async (req, res) => {
  try {
    const memberships = await ProjectMembership.find({ project_id: req.params.projectId })
      .populate('user_id', 'f_name l_name username');
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/projects/:projectId/members', async (req, res) => {
  try {
    const { user_id } = req.body;
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project does not exist' });
    
    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: 'User does not exist' });

    // Prevent duplicate memberships
    const existing = await ProjectMembership.findOne({ project_id: projectId, user_id });
    if (existing) {
      return res.status(409).json({ message: 'User is already a member of this project' });
    }

    await ProjectMembership.create({ project_id: projectId, user_id });
    res.status(201).json({ message: 'Member added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/projects/:projectId/members/:userId', async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project does not exist' });

    // Prevent removing the project lead
    if (project.project_lead_id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the Project Lead' });
    }

    await ProjectMembership.findOneAndDelete({ project_id: projectId, user_id: userId });
    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));