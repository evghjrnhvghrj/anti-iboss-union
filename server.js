const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// Path to users.json file
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serves main.html, etc.

let users = [];

// Load users from file if it exists
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

// GET all registered users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST register a new user
app.post('/api/register', (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid username' });
  }

  if (!users.includes(username)) {
    users.push(username);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return res.json({ success: true, username });
  }

  res.json({ success: true, username, message: 'Already registered' });
});

// POST delete a user (admin only)
app.post('/api/delete', (req, res) => {
  const { username, code } = req.body;
  const ADMIN_CODE = 'delete4freedom';

  if (code !== ADMIN_CODE) {
    return res.status(403).json({ success: false, message: 'Invalid admin code' });
  }

  if (!users.includes(username)) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  users = users.filter(u => u !== username);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.json({ success: true, message: `Deleted ${username}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
