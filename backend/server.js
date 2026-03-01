require('dotenv').config();

const express        = require('express');
const { createServer } = require('http');
const { Server }     = require('socket.io');
const cors           = require('cors');
const connectDB      = require('./config/db');
const Threat         = require('./models/Threat');

// ── Hubungkan ke MongoDB ──
connectDB();

const app        = express();
const httpServer = createServer(app);

// ── Setup Socket.io ──
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
app.set('io', io);

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════
//   REST API ENDPOINTS
// ═══════════════════════════════════════════

// GET semua ancaman (dengan filter)
app.get('/api/threats', async (req, res) => {
  try {
    const { severity, status, province, ip, type, limit = 50 } = req.query;

    const filter = {};
    if (severity) filter.severity             = severity;
    if (status)   filter.status               = status;
    if (province) filter['location.province'] = province;
    if (ip)       filter.sourceIP             = { $regex: ip, $options: 'i' };
    if (type)     filter.type                 = { $regex: type, $options: 'i' };

    const threats = await Threat
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, total: threats.length, data: threats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET statistik dashboard
// ⚠️ HARUS DI ATAS /api/threats/:id
app.get('/api/threats/stats', async (req, res) => {
  try {
    const [total, critical, high, medium, low, active, blocked, resolved] = await Promise.all([
      Threat.countDocuments(),
      Threat.countDocuments({ severity: 'critical' }),
      Threat.countDocuments({ severity: 'high' }),
      Threat.countDocuments({ severity: 'medium' }),
      Threat.countDocuments({ severity: 'low' }),
      Threat.countDocuments({ status: 'active' }),
      Threat.countDocuments({ status: 'blocked' }),
      Threat.countDocuments({ status: 'resolved' }),
    ]);
    res.json({ success: true, data: { total, critical, high, medium, low, active, blocked, resolved } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET seed — isi database dengan data contoh
// ⚠️ HAPUS route ini setelah production!
app.get('/api/threats/seed', async (req, res) => {
  try {
    await Threat.deleteMany({});
    const sampleThreats = [
      { type: 'DDoS Attack',       severity: 'critical', sourceIP: '103.155.12.4',   location: { province: 'DKI Jakarta',      coordinates: { lat: -6.2,  lng: 106.8 } }, protocol: 'HTTP',       port: 80,   riskScore: 95, status: 'active'   },
      { type: 'SQL Injection',     severity: 'critical', sourceIP: '172.16.0.88',    location: { province: 'Jawa Tengah',      coordinates: { lat: -7.15, lng: 110.4 } }, protocol: 'MySQL',      port: 3306, riskScore: 90, status: 'blocked'  },
      { type: 'Brute Force',       severity: 'high',     sourceIP: '10.0.8.55',      location: { province: 'Jawa Barat',       coordinates: { lat: -6.9,  lng: 107.6 } }, protocol: 'SSH',        port: 22,   riskScore: 75, status: 'active'   },
      { type: 'Ransomware',        severity: 'critical', sourceIP: '10.58.50.58',    location: { province: 'Kalimantan Timur', coordinates: { lat: 0.5,   lng: 117.1 } }, protocol: 'SMB',        port: 445,  riskScore: 99, status: 'active'   },
      { type: 'Phishing',          severity: 'high',     sourceIP: '192.168.100.50', location: { province: 'Sumatera Utara',   coordinates: { lat: 3.6,   lng: 98.7  } }, protocol: 'SMTP',       port: 25,   riskScore: 70, status: 'active'   },
      { type: 'XSS',               severity: 'medium',   sourceIP: '192.168.2.77',   location: { province: 'Sulawesi Selatan', coordinates: { lat: -5.15, lng: 119.4 } }, protocol: 'HTTP',       port: 80,   riskScore: 55, status: 'resolved' },
      { type: 'Port Scanning',     severity: 'medium',   sourceIP: '192.168.5.22',   location: { province: 'Jawa Timur',       coordinates: { lat: -7.5,  lng: 112.2 } }, protocol: 'TCP',        port: 0,    riskScore: 40, status: 'active'   },
      { type: 'Zero-Day',          severity: 'critical', sourceIP: '192.168.99.99',  location: { province: 'DI Yogyakarta',    coordinates: { lat: -7.8,  lng: 110.4 } }, protocol: 'HTTPS',      port: 443,  riskScore: 99, status: 'active'   },
      { type: 'Botnet Activity',   severity: 'high',     sourceIP: '10.100.100.10',  location: { province: 'Banten',           coordinates: { lat: -6.4,  lng: 106.1 } }, protocol: 'IRC',        port: 6667, riskScore: 99, isMalicious: true, status: 'active' },
      { type: 'Data Breach',       severity: 'high',     sourceIP: '172.30.0.200',   location: { province: 'Papua',            coordinates: { lat: -4.3,  lng: 138.0 } }, protocol: 'PostgreSQL', port: 5432, riskScore: 85, status: 'active'   },
      { type: 'Malware',           severity: 'high',     sourceIP: '10.10.10.15',    location: { province: 'Bali',             coordinates: { lat: -8.35, lng: 115.1 } }, protocol: 'HTTPS',      port: 8443, riskScore: 80, status: 'active'   },
      { type: 'DNS Hijack',        severity: 'medium',   sourceIP: '172.16.9.2',     location: { province: 'NTT',              coordinates: { lat: -8.6,  lng: 121.0 } }, protocol: 'DNS',        port: 53,   riskScore: 50, status: 'active'   },
      { type: 'Crypto Mining',     severity: 'medium',   sourceIP: '10.20.30.40',    location: { province: 'Riau',             coordinates: { lat: 0.5,   lng: 101.4 } }, protocol: 'Stratum',    port: 3333, riskScore: 45, status: 'blocked'  },
      { type: 'Man-in-the-Middle', severity: 'high',     sourceIP: '192.168.159.33', location: { province: 'Lampung',          coordinates: { lat: -5.4,  lng: 105.3 } }, protocol: 'HTTP',       port: 8080, riskScore: 78, status: 'active'   },
      { type: 'API Abuse',         severity: 'high',     sourceIP: '172.22.0.5',     location: { province: 'Aceh',             coordinates: { lat: 4.7,   lng: 96.7  } }, protocol: 'HTTPS',      port: 443,  riskScore: 72, status: 'active'   },
    ];
    const threats = await Threat.insertMany(sampleThreats);
    res.json({ success: true, message: `✅ ${threats.length} data berhasil ditambahkan!`, total: threats.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST ancaman baru
app.post('/api/threats', async (req, res) => {
  try {
    const threat = await Threat.create(req.body);
    io.emit('new-threat', threat);
    if (threat.severity === 'critical') {
      io.emit('critical-alert', threat);
    }
    res.status(201).json({ success: true, data: threat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH update status ancaman
app.patch('/api/threats/:id', async (req, res) => {
  try {
    const threat = await Threat.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!threat) return res.status(404).json({ success: false, message: 'Ancaman tidak ditemukan' });
    io.emit('threat-updated', threat);
    res.json({ success: true, data: threat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET detail satu ancaman
app.get('/api/threats/:id', async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) return res.status(404).json({ success: false, message: 'Ancaman tidak ditemukan' });
    res.json({ success: true, data: threat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET test server
app.get('/', (req, res) => {
  res.json({
    message  : '🛡️ FORTUNA SOC API — Server Berjalan!',
    version  : '1.0.0',
    status   : 'online',
    endpoints: [
      'GET   /api/threats',
      'GET   /api/threats/stats',
      'GET   /api/threats/seed',
      'POST  /api/threats',
      'GET   /api/threats/:id',
      'PATCH /api/threats/:id',
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} tidak ditemukan` });
});

// ═══════════════════════════════════════════
//   SOCKET.IO
// ═══════════════════════════════════════════
io.on('connection', (socket) => {
  console.log(`👤 Dashboard terhubung  | ID: ${socket.id}`);
  socket.emit('connected', { message: 'Terhubung ke FORTUNA SOC!', socketId: socket.id });
  socket.on('disconnect', () => {
    console.log(`👋 Dashboard terputus   | ID: ${socket.id}`);
  });
});

// ═══════════════════════════════════════════
//   JALANKAN SERVER
// ═══════════════════════════════════════════
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════╗');
  console.log('  ║   🛡️  FORTUNA SOC v1.0.0         ║');
  console.log(`  ║   🚀  http://localhost:${PORT}      ║`);
  console.log(`  ║   📡  Mode: ${process.env.NODE_ENV}          ║`);
  console.log('  ╚══════════════════════════════════╝');
  console.log('');
});
