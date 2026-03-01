const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────
// Middleware: Cek token JWT di setiap request
//
// Cara kerja:
// 1. Frontend kirim request dengan header:
//    Authorization: Bearer <token>
// 2. Middleware ini cek apakah token valid
// 3. Kalau valid → lanjut ke route handler
// 4. Kalau tidak valid → tolak dengan status 401
// ─────────────────────────────────────────
const protect = (req, res, next) => {
  try {
    // Ambil token dari header
    const authHeader = req.headers.authorization;

    // Cek apakah header ada dan formatnya benar
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success : false,
        message : 'Akses ditolak. Token tidak ditemukan.'
      });
    }

    // Ambil token-nya saja (hapus kata "Bearer ")
    const token = authHeader.split(' ')[1];

    // Verifikasi token menggunakan JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan info user ke req supaya bisa dipakai di route handler
    req.user = decoded;  // { id, role }

    // Lanjut ke handler berikutnya
    next();

  } catch (err) {
    // Token tidak valid atau sudah kadaluarsa
    return res.status(401).json({
      success : false,
      message : 'Token tidak valid atau sudah kadaluarsa. Silakan login ulang.'
    });
  }
};

// ─────────────────────────────────────────
// Middleware: Cek role user (admin only)
// Pakai setelah middleware protect
// Contoh: router.delete('/:id', protect, adminOnly, handler)
// ─────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success : false,
      message : 'Akses ditolak. Hanya admin yang bisa melakukan ini.'
    });
  }
  next();
};

module.exports = protect;
module.exports.adminOnly = adminOnly;
