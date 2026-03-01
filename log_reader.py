# Script ini membaca log sistem dan mengirim ke backend kamu
import requests
import time
import re
from datetime import datetime

BACKEND_URL = "http://localhost:5000/api/threats"
LOG_FILE = "/var/log/auth.log"  # Log SSH di Linux

def parse_failed_login(line):
  """Deteksi percobaan login gagal (Brute Force)"""
  if "Failed password" in line:
    ip_match = re.search(r'from (\d+\.\d+\.\d+\.\d+)', line)
    if ip_match:
      return {
        "type": "Brute Force",
        "severity": "high",
        "sourceIP": ip_match.group(1),
        "location": { "province": "Unknown" },
        "protocol": "SSH",
        "port": 22,
        "rawLog": line.strip()
      }
  return None

def send_threat(threat_data):
  try:
    response = requests.post(BACKEND_URL, json=threat_data, timeout=5)
    if response.status_code == 201:
      print(f"✅ Ancaman dikirim: {threat_data['type']} dari {threat_data['sourceIP']}")
  except Exception as e:
    print(f"❌ Gagal kirim: {e}")

# Monitor log file secara real-time
print("🔍 Memulai monitoring log...")
with open(LOG_FILE, 'r') as f:
  f.seek(0, 2)  # Mulai dari akhir file
  while True:
    line = f.readline()
    if line:
      threat = parse_failed_login(line)
      if threat:
        send_threat(threat)
    else:
      time.sleep(0.1) 