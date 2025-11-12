const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// 🔗 KONEKSI KE DATABASE
// ======================
const db = await mysql.createPool({
  host: '100.123.155.30',
  user: 'root',      // ganti sesuai user MySQL kamu
  password: ':4GuNg210105182040',      // ganti sesuai password MySQL kamu
  database: 'apikey' // ganti sesuai nama database
});

// ======================
// 🔑 GENERATE API KEY
// ======================
function generateApiKey(length = 40) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const buf = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < buf.length; i++) out += alphabet[buf[i] % alphabet.length];
  return `sk-${out}`;
}

// ======================
// 🧩 CREATE API KEY
// ======================
app.post('/create', async (req, res) => {
  try {
    const key = generateApiKey();

    // Simpan ke database
    await db.query('INSERT INTO api_keys (`key`) VALUES (?)', [key]);

    console.log('Generated and saved key:', key);
    res.json({ message: 'API key generated and saved', api_key: key });
  } catch (err) {
    console.error('❌ Error inserting key:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// ======================
// 🔍 CHECK API KEY
// ======================
app.post('/checkapi', async (req, res) => {
  const clientKey = req.body.api_key;

  if (!clientKey) {
    return res.status(400).json({
      valid: false,
      message: 'Missing api_key in body'
    });
  }

  // Cek format dulu
  const isValidFormat =
    clientKey.startsWith('sk-') &&
    clientKey.length >= 10 &&
    /^[A-Za-z0-9\-]+$/.test(clientKey);

  if (!isValidFormat) {
    return res.status(401).json({
      valid: false,
      message: 'Invalid API key format'
    });
  }

  // Cek apakah key ada di database
  try {
    const [rows] = await db.query('SELECT * FROM api_keys WHERE `key` = ?', [clientKey]);

    if (rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message: 'API key not found'
      });
    }

    // Kalau ditemukan:
    return res.json({
      valid: true,
      message: 'API key is valid',
      data: rows[0]
    });
  } catch (err) {
    console.error('❌ Error checking key:', err);
    return res.status(500).json({
      valid: false,
      message: 'Database error'
    });
  }
});
