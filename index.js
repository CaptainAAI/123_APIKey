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
