const mongoose = require('mongoose');

// Schema = "bentuk" data yang disimpan di MongoDB
const ThreatSchema = new mongoose.Schema({
  
  type: {
    type: String,
    required: true,
    // Jenis ancaman yang diizinkan
    enum: ['DDoS Attack', 'SQL Injection', 'Brute Force', 
            'Malware', 'Ransomware', 'Phishing', 'XSS', 
            'Port Scanning', 'Unauthorized Access', 'Other']
  },

  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low']
  },

  sourceIP: {
    type: String,
    required: true,
    // Validasi format IP address
    match: /^(\d{1,3}\.){3}\d{1,3}$/
  },

  location: {
    province: { type: String, required: true },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },

  status: {
    type: String,
    default: 'active',
    enum: ['active', 'blocked', 'resolved']
  },

  protocol: { type: String },    // HTTP, HTTPS, SSH, dll
  port: { type: Number },          // Port yang diserang
  riskScore: { type: Number, min: 0, max: 100 },
  isMalicious: { type: Boolean, default: false },
  rawLog: { type: String },        // Log mentah dari sistem

}, { 
  timestamps: true  // Otomatis tambahkan createdAt dan updatedAt
});

// Index untuk pencarian cepat
ThreatSchema.index({ severity: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Threat', ThreatSchema);
5. Server Utama (Express + Socket.io)
JAVASCRIPT
backend/server.js
require('dotenv').config();  // Load file .env
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Threat = require('./models/Threat');

// Hubungkan ke MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

// Setup Socket.io untuk real-time
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.json());

// ═══ REST API ENDPOINTS ═══

// GET semua ancaman (dengan filter)
app.get('/api/threats', async (req, res) => {
  try {
    const { severity, status, province, limit = 50 } = req.query;
    
    // Bangun filter berdasarkan query parameter
    const filter = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (province) filter['location.province'] = province;

    const threats = await Threat
      .find(filter)
      .sort({ createdAt: -1 })   // Terbaru dulu
      .limit(parseInt(limit));

    res.json({ success: true, data: threats, total: threats.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST ancaman baru (dari sistem eksternal / agen)
app.post('/api/threats', async (req, res) => {
  try {
    const threat = await Threat.create(req.body);
    
    // 🔥 KIRIM KE SEMUA BROWSER YANG SEDANG BUKA DASHBOARD!
    io.emit('new-threat', threat);
    
    // Jika critical, emit event khusus untuk alert
    if (threat.severity === 'critical') {
      io.emit('critical-alert', threat);
    }

    res.status(201).json({ success: true, data: threat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET statistik dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const [total, critical, active] = await Promise.all([
      Threat.countDocuments(),
      Threat.countDocuments({ severity: 'critical' }),
      Threat.countDocuments({ status: 'active' }),
    ]);
    res.json({ success: true, data: { total, critical, active } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══ SOCKET.IO EVENTS ═══
io.on('connection', (socket) => {
  console.log(`👤 Dashboard terhubung: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`👋 Dashboard terputus: ${socket.id}`);
  });
});

// Jalankan server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});