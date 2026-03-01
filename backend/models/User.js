const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  name: {
    type     : String,
    required : [true, 'Nama wajib diisi'],
    trim     : true,
    maxlength: [50, 'Nama maksimal 50 karakter']
  },

  email: {
    type     : String,
    required : [true, 'Email wajib diisi'],
    unique   : true,                          // Tidak boleh email duplikat
    lowercase: true,
    match    : [/^\S+@\S+\.\S+$/, 'Format email tidak valid']
  },

  password: {
    type    : String,
    required: [true, 'Password wajib diisi'],
    minlength: [6, 'Password minimal 6 karakter'],
    select  : false       // Password tidak ikut tampil saat query biasa
  },

  role: {
    type   : String,
    enum   : ['admin', 'analyst', 'viewer'],
    default: 'analyst'
    // admin   → bisa semua (hapus, block, dll)
    // analyst → bisa lihat dan update status
    // viewer  → hanya bisa lihat
  },

  isActive: {
    type   : Boolean,
    default: true
  },

  lastLogin: {
    type: Date
  }

}, {
  timestamps: true     // Otomatis tambah createdAt dan updatedAt
});

module.exports = mongoose.model('User', UserSchema);
