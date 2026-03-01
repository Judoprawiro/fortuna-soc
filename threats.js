const express = require('express');
const router  = express.Router();
const Threat  = require('../models/Threat');

// ─────────────────────────────────────────
// GET /api/threats
// Ambil semua ancaman — bisa difilter
// Contoh: /api/threats?severity=critical&status=active&limit=20
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { severity, status, province, ip, type, limit = 50 } = req.query;

    // Bangun objek filter berdasarkan query yang dikirim
    const filter = {};
    if (severity) filter.severity             = severity;
    if (status)   filter.status               = status;
    if (province) filter['location.province'] = province;
    if (ip)       filter.sourceIP             = { $regex: ip, $options: 'i' };
    if (type)     filter.type                 = { $regex: type, $options: 'i' };

    const threats = await Threat
      .find(filter)
      .sort({ createdAt: -1 })       // Terbaru tampil paling atas
      .limit(parseInt(limit));

    res.json({
      success : true,
      total   : threats.length,
      data    : threats
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/threats/stats
// Statistik untuk kartu angka di dashboard
// ─────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    // Jalankan semua query sekaligus (lebih cepat)
    const [total, critical, high, medium, active, blocked, resolved] = await Promise.all([
      Threat.countDocuments(),
      Threat.countDocuments({ severity: 'critical' }),
      Threat.countDocuments({ severity: 'high' }),
      Threat.countDocuments({ severity: 'medium' }),
      Threat.countDocuments({ status: 'active' }),
      Threat.countDocuments({ status: 'blocked' }),
      Threat.countDocuments({ status: 'resolved' }),
    ]);

    res.json({
      success : true,
      data    : { total, critical, high, medium, active, blocked, resolved }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/threats/:id
// Detail satu ancaman berdasarkan ID
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);

    if (!threat) {
      return res.status(404).json({ success: false, message: 'Ancaman tidak ditemukan' });
    }

    res.json({ success: true, data: threat });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/threats
// Tambah ancaman baru
// Dipanggil oleh: agen Python, script log reader, atau manual
// ─────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const threat = await Threat.create(req.body);

    // Kirim ke semua browser via Socket.io
    // req.app.get('io') = ambil instance io yang disimpan di app
    const io = req.app.get('io');
    if (io) {
      io.emit('new-threat', threat);                           // Semua ancaman baru
      if (threat.severity === 'critical') {
        io.emit('critical-alert', threat);                     // Khusus critical
      }
    }

    res.status(201).json({ success: true, data: threat });

  } catch (err) {
    // Jika validasi MongoDB gagal (misal IP format salah)
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/threats/:id
// Update status ancaman (active → blocked / resolved)
// ─────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const threat = await Threat.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }  // Kembalikan data yang sudah diupdate
    );

    if (!threat) {
      return res.status(404).json({ success: false, message: 'Ancaman tidak ditemukan' });
    }

    // Broadcast perubahan status ke semua dashboard
    const io = req.app.get('io');
    if (io) io.emit('threat-updated', threat);

    res.json({ success: true, data: threat });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// DELETE /api/threats/:id
// Hapus ancaman (admin only — nanti tambahkan auth middleware)
// ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const threat = await Threat.findByIdAndDelete(req.params.id);

    if (!threat) {
      return res.status(404).json({ success: false, message: 'Ancaman tidak ditemukan' });
    }

    res.json({ success: true, message: 'Ancaman berhasil dihapus' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
