import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

// ✅ Setup __dirname untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Koneksi ke MySQL
const db = await mysql.createPool({
  host: "100.123.155.30",      // ganti sesuai konfigurasi kamu
  user: "root",           // username MySQL
  password: ":4GuNg210105182040",           // password MySQL
  database: "apikey"    // nama database kamu
});

// ✅ Endpoint generate API key baru
app.post("/api/generate", async (req, res) => {
  try {
    const apiKey = Math.random().toString(36).substring(2, 15);

    // Simpan ke tabel `apikeys`
    await db.query("INSERT INTO apikeys (`key`, createdAt) VALUES (?, NOW())", [apiKey]);

    res.json({
      success: true,
      key: apiKey
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate API key"
    });
  }
});

// ✅ Endpoint ambil semua API key (opsional)
app.get("/api/list", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM apikeys ORDER BY createdAt DESC");
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Failed to fetch keys" });
  }
});

// ✅ Serve halaman utama (public/index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Jalankan server
app.listen(port, () => {
  console.log(`🚀 LordaAI APIKey Server running at http://localhost:${port}`);
});
