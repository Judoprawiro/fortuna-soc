const mongoose = require('mongoose');

const ThreatSchema = new mongoose.Schema({

  type: {
    type    : String,
    required: true,
    enum    : [
      'DDoS Attack', 'SQL Injection', 'Brute Force',
      'Malware', 'Ransomware', 'Phishing', 'XSS',
      'Port Scanning', 'Unauthorized Access',
      'Zero-Day', 'Man-in-the-Middle', 'DNS Hijack',
      'Data Breach', 'Botnet Activity', 'Crypto Mining',
      'API Abuse', 'CSRF Attack', 'Other'
    ]
  },

  severity: {
    type    : String,
    required: true,
    enum    : ['critical', 'high', 'medium', 'low']
  },

  sourceIP: {
    type    : String,
    required: true,
    match   : /^(\d{1,3}\.){3}\d{1,3}$/
  },

  location: {
    province: { type: String, required: true },
    city    : { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },

  status: {
    type   : String,
    default: 'active',
    enum   : ['active', 'blocked', 'resolved']
  },

  protocol  : { type: String },
  port      : { type: Number },
  riskScore : { type: Number, min: 0, max: 100 },
  isMalicious: { type: Boolean, default: false },
  rawLog    : { type: String },

}, {
  timestamps: true
});

ThreatSchema.index({ severity: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Threat', ThreatSchema);
