const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory user store (for demo purposes)
let users = [
  { id: 1, name: 'mohamed makram', email: 'mohamed@example.com', role: 'customer' },
  { id: 2, name: 'yasmina khaled', email: 'yasmina@example.com', role: 'admin' }
];

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'user-management-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: users,
    count: users.length
  });
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  res.json({
    success: true,
    data: user
  });
});

app.post('/api/users', (req, res) => {
  const { name, email, role } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    role: role || 'customer'
  };

  users.push(newUser);
  
  res.status(201).json({
    success: true,
    data: newUser,
    message: 'User created successfully'
  });
});

app.put('/api/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const { name, email, role } = req.body;
  users[userIndex] = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    role: role || users[userIndex].role
  };

  res.json({
    success: true,
    data: users[userIndex],
    message: 'User updated successfully'
  });
});

app.delete('/api/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  users.splice(userIndex, 1);
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 User Management API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
});

