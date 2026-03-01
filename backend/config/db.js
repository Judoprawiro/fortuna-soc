const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB terhubung: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.log(`⚠️  Server tetap jalan tanpa database...`);
    // Hapus process.exit(1) — server tidak langsung mati!
  }
};

module.exports = connectDB;