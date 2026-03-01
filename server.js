// ═══════════════════════════════════════════════
//   FORTUNA SOC — Backend Server
//   Entry point utama aplikasi
// ═══════════════════════════════════════════════

require('dotenv').config();                        // Load .env dulu sebelum apapun

const express     = require('express');
const { createServer } = require('http');
const { Server }  = require('socket.io');
const cors        = require('cors');
const connectDB   = require('./config/db');

// ── Import semua route ──
const threatRoutes = require('./routes/threats');
const authRoutes   = require('./routes/auth');

// ── Hubungkan ke MongoDB ──
connectDB();

// ── Setup Express ──
const app        = express();
const httpServer = createServer(app);             // HTTP server (wajib untuk Socket.io)

// ── Setup Socket.io ──
const io = new Server(httpServer, {
  cors: {
    origin : '*',                                 // Izinkan semua origin (development)
    methods: ['GET', 'POST']
  }
});

// Simpan instance io di app supaya bisa diakses dari route
// (lihat penggunaan req.app.get('io') di routes/threats.js)
app.set('io', io);

// ═══════════════════════════════════════════════
//   MIDDLEWARE
// ═══════════════════════════════════════════════
app.use(cors());                                  // Izinkan request dari browser
app.use(express.json());                          // Parse JSON body otomatis
app.use(express.urlencoded({ extended: true }));  // Parse form data

// ═══════════════════════════════════════════════
//   ROUTES
// ═══════════════════════════════════════════════
app.use('/api/threats', threatRoutes);            // /api/threats
app.use('/api/auth',    authRoutes);              // /api/auth/login, /api/auth/register

// Route test — untuk cek server berjalan
app.get('/', (req, res) => {
  res.json({
    message : '🛡️ FORTUNA SOC API — Server Berjalan!',
    version : '1.0.0',
    status  : 'online',
    time    : new Date().toISOString()
  });
});

// Route tidak ditemukan (404)
app.use((req, res) => {
  res.status(404).json({
    success : false,
    message : `Route ${req.method} ${req.url} tidak ditemukan`
  });
});

// ═══════════════════════════════════════════════
//   SOCKET.IO — Real-time Events
// ═══════════════════════════════════════════════
io.on('connection', (socket) => {
  console.log(`👤 Dashboard terhubung  | ID: ${socket.id}`);

  // Kirim konfirmasi ke client yang baru konek
  socket.emit('connected', {
    message: 'Terhubung ke FORTUNA SOC Real-time Server',
    socketId: socket.id
  });

  socket.on('disconnect', () => {
    console.log(`👋 Dashboard terputus   | ID: ${socket.id}`);
  });
});

// ═══════════════════════════════════════════════
//   JALANKAN SERVER
// ═══════════════════════════════════════════════
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log('');
  console.log('  ███████╗ ██████╗  ██████╗ ');
  console.log('  ██╔════╝██╔═══██╗██╔════╝ ');
  console.log('  ███████╗██║   ██║██║      ');
  console.log('  ╚════██║██║   ██║██║      ');
  console.log('  ███████║╚██████╔╝╚██████╗ ');
  console.log('  ╚══════╝ ╚═════╝  ╚═════╝ ');
  console.log('');
  console.log(`  🛡️  FORTUNA SOC v1.0.0`);
  console.log(`  🚀  Server  : http://localhost:${PORT}`);
  console.log(`  📡  Mode    : ${process.env.NODE_ENV}`);
  console.log(`  ⏰  Waktu   : ${new Date().toLocaleString('id-ID')}`);
  console.log('');
});
