const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');

// ─────────────────────────────────────────
// POST /api/auth/register
// Daftar user baru (admin SOC)
// ─────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Cek apakah email sudah terdaftar
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // Hash password sebelum disimpan — JANGAN pernah simpan password polos!
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru
    const user = await User.create({
      name,
      email,
      password : hashedPassword,
      role     : role || 'analyst'   // Default role: analyst
    });

    // Buat token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }            // Token berlaku 7 hari
    );

    res.status(201).json({
      success : true,
      message : 'User berhasil dibuat',
      token,
      user    : {
        id    : user._id,
        name  : user.name,
        email : user.email,
        role  : user.role
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/auth/login
// Login user dan dapat token JWT
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    // Cari user di database
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Bandingkan password yang diketik dengan yang di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Buat token JWT baru
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success : true,
      message : 'Login berhasil',
      token,
      user    : {
        id    : user._id,
        name  : user.name,
        email : user.email,
        role  : user.role
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/auth/me
// Cek siapa yang sedang login (butuh token)
// ─────────────────────────────────────────
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
