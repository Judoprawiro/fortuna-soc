# 🛡️ FORTUNA SOC
### Unit Intelijen Siber — Real-time Cybersecurity Monitoring Dashboard

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20MongoDB%20%7C%20Socket.io-cyan)
![License](https://img.shields.io/badge/license-MIT-green)

> Sistem monitoring ancaman siber real-time berbasis web — menampilkan insiden keamanan, peta interaktif, threat hunting, dan laporan otomatis dalam satu dashboard terintegrasi.

---

## ✨ Fitur Utama

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| 📡 **Dashboard SOC** | Monitoring insiden real-time dengan radar animasi dan statistik live | ✅ Live |
| 🗺️ **Monitor Ancaman** | Peta interaktif Indonesia dengan titik serangan dan pulse animation | ✅ Live |
| 🎯 **Threat Hunting** | Pencarian & filter ancaman historis dengan sorting dan pagination | ✅ Live |
| 📄 **Laporan Otomatis** | Generate laporan keamanan lengkap dengan chart dan export PDF | ✅ Live |
| 🚨 **Alert System** | Notifikasi popup real-time + sound alert untuk ancaman critical | ✅ Live |
| 📈 **Live Charts** | Grafik tren serangan 24 jam dan distribusi severity | ✅ Live |
| 🔌 **REST API** | API lengkap dengan filter, pagination, dan real-time WebSocket | ✅ Live |
| 🗄️ **MongoDB Atlas** | Database cloud dengan 15+ jenis ancaman siber Indonesia | ✅ Live |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    SUMBER DATA                          │
│   Snort/Suricata  │  Firewall Logs  │  Server Logs      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js)                       │
│   Express.js API  │  Socket.io  │  Alert Engine         │
└─────────────────────────────────────────────────────────┘
                    │               │
          ┌─────────┘               └──────────┐
          ▼                                    ▼
┌──────────────────┐              ┌────────────────────────┐
│  MongoDB Atlas   │              │  Frontend (Browser)     │
│  (Data Storage)  │              │  Dashboard · Map · Hunt │
└──────────────────┘              └────────────────────────┘
```

---

## 🚀 Quick Start

### Prasyarat
- Node.js v18+
- Akun MongoDB Atlas (gratis)
- Git

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/Judoprawiro/fortuna-soc.git
cd fortuna-soc/backend

# 2. Install dependencies
npm install

# 3. Buat file konfigurasi
cp .env.example .env
# Edit .env dengan kredensial MongoDB Atlas kamu
```

### Konfigurasi `.env`

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/fortunasoc?appName=Cluster0
JWT_SECRET=ganti_dengan_random_string_panjang
PORT=5000
NODE_ENV=development
```

### Jalankan Server

```bash
npm run dev

# Output:
# ╔══════════════════════════════════╗
# ║   🛡️  FORTUNA SOC v1.0.0         ║
# ║   🚀  http://localhost:5000      ║
# ╚══════════════════════════════════╝
# ✅ MongoDB terhubung: cluster0.mongodb.net
```

### Isi Data Contoh

```
GET http://localhost:5000/api/threats/seed
```

### Buka Dashboard

Buka `frontend/fortuna-soc-final.html` di browser.

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/threats` | Ambil semua ancaman (support filter) |
| `GET` | `/api/threats/stats` | Statistik dashboard |
| `GET` | `/api/threats/seed` | Isi data contoh (dev only) |
| `POST` | `/api/threats` | Tambah ancaman baru |
| `GET` | `/api/threats/:id` | Detail satu ancaman |
| `PATCH` | `/api/threats/:id` | Update status ancaman |

### Filter Parameter

| Parameter | Nilai | Contoh |
|-----------|-------|--------|
| `severity` | critical, high, medium, low | `?severity=critical` |
| `status` | active, blocked, resolved | `?status=active` |
| `province` | Nama provinsi | `?province=DKI Jakarta` |
| `ip` | IP address (partial) | `?ip=192.168` |
| `limit` | Jumlah data (default: 50) | `?limit=20` |

### Contoh Request

```bash
# Ambil ancaman critical yang aktif
curl "http://localhost:5000/api/threats?severity=critical&status=active"

# Kirim ancaman baru
curl -X POST http://localhost:5000/api/threats \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DDoS Attack",
    "severity": "critical",
    "sourceIP": "103.155.12.4",
    "location": { "province": "DKI Jakarta", "coordinates": { "lat": -6.2, "lng": 106.8 } },
    "protocol": "HTTP",
    "port": 80,
    "riskScore": 95
  }'
```

---

## 🔌 WebSocket Events

| Event | Arah | Deskripsi |
|-------|------|-----------|
| `connected` | Server → Client | Konfirmasi koneksi berhasil |
| `new-threat` | Server → Client | Ancaman baru masuk real-time |
| `critical-alert` | Server → Client | Alert khusus ancaman critical |
| `threat-updated` | Server → Client | Status ancaman diperbarui |

---

## 🛠️ Tech Stack

**Frontend:** HTML5 · CSS3 · JavaScript · Leaflet.js · Chart.js · Socket.io Client

**Backend:** Node.js · Express.js · Socket.io · Mongoose · JWT · bcryptjs

**Database:** MongoDB Atlas (Cloud)

---

## 📁 Struktur Project

```
fortuna-soc/
├── 📁 backend/
│   ├── server.js              # Entry point, Express + Socket.io
│   ├── package.json
│   ├── .env.example           # Template konfigurasi
│   ├── 📁 config/
│   │   └── db.js              # Koneksi MongoDB
│   ├── 📁 models/
│   │   ├── Threat.js          # Schema ancaman
│   │   └── User.js            # Schema user
│   ├── 📁 middleware/
│   │   └── auth.js            # JWT middleware
│   └── 📁 routes/
│       ├── threats.js         # Routes ancaman
│       └── auth.js            # Routes autentikasi
│
├── 📁 frontend/
│   └── fortuna-soc-final.html # Dashboard utama (4 halaman)
│
├── log_reader.py              # Python agent pembaca log
├── .gitignore
└── README.md
```

---

## 🗺️ Roadmap

### Selesai ✅
- [x] Dashboard SOC — 4 halaman lengkap
- [x] Radar animasi & live simulation
- [x] Peta interaktif Indonesia (Leaflet.js)
- [x] Threat Hunting dengan filter & search
- [x] Laporan keamanan & export PDF
- [x] Sound alert & notifikasi popup
- [x] Backend Node.js + Express
- [x] MongoDB Atlas integration
- [x] WebSocket real-time (Socket.io)
- [x] REST API lengkap dengan filter
- [x] 15+ jenis ancaman siber Indonesia
- [x] Deploy ke GitHub

### Berikutnya 🚧
- [ ] Autentikasi JWT (Login/Logout)
- [ ] Python agent untuk baca log sistem
- [ ] Deploy ke cloud (Railway/Render)
- [ ] Integrasi Snort/Suricata
- [ ] Mobile responsive
- [ ] Export data ke Excel/CSV

---

## ⚠️ Keamanan

- Jangan commit `.env` ke repository
- Gunakan `.env.example` sebagai template
- Ganti `JWT_SECRET` dengan string random yang panjang
- Batasi IP whitelist MongoDB Atlas di production
- Hapus route `/api/threats/seed` sebelum production

---

## 👨‍💻 Developer

Dibuat dengan ❤️ dan semangat belajar

> Mulai belajar coding: **2 Januari 2026** | Project FORTUNA SOC: **Februari 2026**

*"Dari nol, belajar VSCode, Node.js, MongoDB, GitHub — dan berhasil membangun sistem monitoring keamanan siber real-time dalam 57 hari. Perjalanan masih panjang, tapi setiap baris kode adalah langkah maju."*

**Background:** Seniman Lukis → Telekomunikasi (SSB, Microwave, Satellite, BTS) → AI & Coding

---

## 📜 License

Distributed under the MIT License.

---

⭐ **Jika project ini membantu, jangan lupa kasih Star!** ⭐
