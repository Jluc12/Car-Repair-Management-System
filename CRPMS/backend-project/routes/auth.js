const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: 'Username already exists.' });
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;
    res.json({ message: 'Login successful.', user: { username: user.username, role: user.role } });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) return res.status(400).json({ message: 'Username and new password are required.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'No account found with that username.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed.' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully.' });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.userId)
    return res.json({ username: req.session.username, role: req.session.role });
  res.status(401).json({ message: 'Not authenticated.' });
});

module.exports = router;