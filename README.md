# 🛡️ FORTUNA SOC
### *Unit Intelijen Siber — Real-time Cybersecurity Monitoring Dashboard*

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-00d4ff?style=for-the-badge&logo=shield&logoColor=white)
![Status](https://img.shields.io/badge/status-LIVE%20DEMO-00ff9d?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20MongoDB%20%7C%20Socket.io-ff8c00?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-a855f7?style=for-the-badge)

<br/>

> **Sistem monitoring ancaman siber real-time berbasis web — menampilkan insiden keamanan, peta interaktif, threat hunting, dan laporan otomatis dalam satu dashboard yang terintegrasi.**

<br/>

[🚀 Live Demo](#) · [📖 Dokumentasi](#dokumentasi) · [🐛 Report Bug](../../issues) · [💡 Request Feature](../../issues)

</div>

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📡 **Dashboard SOC** | Monitoring insiden real-time dengan radar animasi, log live, dan statistik |
| 🗺️ **Monitor Ancaman** | Peta interaktif Indonesia dengan titik serangan dan pulse animation |
| 🎯 **Threat Hunting** | Pencarian & filter ancaman historis dengan sorting dan pagination |
| 📄 **Laporan Otomatis** | Generate laporan keamanan lengkap dengan chart dan export PDF |
| 🚨 **Alert System** | Notifikasi popup real-time + sound alert untuk ancaman critical |
| 📈 **Live Charts** | Grafik tren serangan 24 jam dan distribusi severity |

---

## 🖥️ Screenshot

<div align="center">

### Dashboard SOC — Monitoring Real-time
```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ FORTUNASOC          ● SYSTEM ONLINE           20:44:27      │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ TOTAL        │ CRITICAL     │ MONITORING   │ HEALTH            │
│ 1,254        │ 12           │ 8            │ 98%               │
├──────────────┴──────────────┴──────────────┴───────────────────┤
│ INCIDENTS LOG (LIVE)        │ TREN SERANGAN   │ THREAT RADAR    │
│ 103.155.12.4  DDoS  CRIT.. │ ▁▂▄▆█▄▂▁▄▆█    │    ◉ ACTIVE     │
│ 45.12.110.89  SQLi  HIGH.. │                 │   /spinning\    │
│ 182.22.45.1   Malw  MED..  │ ──────────────  │                 │
└─────────────────────────────────────────────────────────────────┘
```

### Monitor Ancaman — Peta Interaktif Indonesia
```
┌─────────────────────────────────────────┬──────────────────────┐
│                                         │ 📋 PERISTIWA TERBARU │
│        🗺️  PETA INDONESIA               ├──────────────────────┤
│                                         │ 🔴 DDoS Attack       │
│   🔴Jakarta  🟠Surabaya                 │    DKI Jakarta       │
│      🔴Bali  🟡Medan  🔴Papua           │    192.168.1.108     │
│                                         ├──────────────────────┤
│  ● TOTAL: 15  ● KRITIS: 5              │ 🟠 Brute Force       │
│                                         │    Jawa Barat        │
└─────────────────────────────────────────┴──────────────────────┘
```

</div>

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    SUMBER DATA                          │
│  Snort/Suricata  │  Firewall Logs  │  Server Logs       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js)                        │
│   Express.js API  │  Socket.io  │  Alert Engine         │
└─────────────────────────────────────────────────────────┘
                    │           │
          ┌─────────┘           └─────────┐
          ▼                               ▼
┌──────────────────┐           ┌──────────────────────────┐
│  MongoDB         │           │  Frontend (Browser)       │
│  (Event Storage) │           │  Dashboard · Map · Hunt   │
└──────────────────┘           └──────────────────────────┘
```

---

## 🚀 Quick Start

### Prasyarat
Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/atlas) (Atlas gratis)
- [Git](https://git-scm.com/)

### Instalasi

```bash
# 1. Clone repository ini
git clone https://github.com/USERNAME/fortuna-soc.git
cd fortuna-soc

# 2. Masuk ke folder backend
cd backend

# 3. Install dependencies
npm install

# 4. Buat file konfigurasi
cp .env.example .env
```

### Konfigurasi `.env`

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fortunasoc
JWT_SECRET=ganti_dengan_random_string_panjang
PORT=5000
NODE_ENV=development
```

### Jalankan Server

```bash
# Mode development (auto-restart)
npm run dev

# Mode production
npm start
```

```bash
# Output yang diharapkan:
# ✅ MongoDB terhubung: cluster.mongodb.net
# 🚀 Server berjalan di http://localhost:5000
```

### Buka Dashboard

Buka file `frontend/fortuna-soc-final.html` di browser, atau akses:
```
http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/threats` | Ambil semua ancaman (support filter) |
| `POST` | `/api/threats` | Tambah ancaman baru |
| `GET` | `/api/threats/:id` | Detail satu ancaman |
| `PATCH` | `/api/threats/:id` | Update status ancaman |
| `GET` | `/api/stats` | Statistik dashboard |
| `POST` | `/api/auth/login` | Login user |

### Contoh Request

```bash
# Ambil semua ancaman critical yang masih aktif
curl http://localhost:5000/api/threats?severity=critical&status=active

# Kirim ancaman baru (dari agen/script monitoring)
curl -X POST http://localhost:5000/api/threats \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DDoS Attack",
    "severity": "critical",
    "sourceIP": "192.168.1.100",
    "location": { "province": "DKI Jakarta" },
    "protocol": "HTTP",
    "port": 80
  }'
```

---

## 🛠️ Tech Stack

**Frontend:**
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=flat&logo=leaflet&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chartdotjs&logoColor=white)

**Backend:**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white)

**Database:**
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

**Deploy:**
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)

---

## 📁 Struktur Project

```
fortuna-soc/
├── 📁 backend/
│   ├── server.js           # Entry point & Socket.io
│   ├── package.json
│   ├── .env.example        # Template konfigurasi
│   ├── 📁 routes/
│   │   ├── threats.js      # CRUD ancaman
│   │   ├── auth.js         # Autentikasi
│   │   └── reports.js      # Generate laporan
│   ├── 📁 models/
│   │   ├── Threat.js       # Schema MongoDB
│   │   └── User.js         # Schema User
│   ├── 📁 middleware/
│   │   └── auth.js         # JWT middleware
│   └── 📁 config/
│       └── db.js           # Koneksi MongoDB
│
├── 📁 frontend/
│   └── fortuna-soc-final.html   # Dashboard utama
│
├── 📁 agent/
│   └── log_reader.py       # Script Python pembaca log
│
├── .gitignore
└── README.md
```

---

## 🗺️ Roadmap

- [x] Demo Dashboard (HTML/CSS/JS)
- [x] Radar animasi & live simulation
- [x] Peta interaktif Indonesia (Leaflet.js)
- [x] Threat Hunting dengan filter & search
- [x] Laporan keamanan & export PDF
- [x] Sound alert & notifikasi popup
- [ ] Backend Node.js + MongoDB integration
- [ ] WebSocket real-time data
- [ ] Autentikasi JWT (Login/Logout)
- [ ] Python agent untuk baca log sistem
- [ ] Deploy ke cloud (Railway)
- [ ] Integrasi Snort/Suricata
- [ ] Mobile responsive

---

## 🤝 Kontribusi

Kontribusi sangat disambut! Jika ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m 'Tambah fitur keren'`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buat Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Developer

<div align="center">

**Dibuat dengan ❤️ dan semangat belajar**

*Mulai belajar coding: Januari 2026*
*Project ini: Februari 2026*

> *"Dari nol, belajar VSCode, Node.js, MongoDB, GitHub — dan berhasil membangun sistem monitoring keamanan siber. Perjalanan masih panjang, tapi setiap baris kode adalah langkah maju."*

---

⭐ **Jika project ini membantu, jangan lupa kasih Star!** ⭐

</div>
