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
