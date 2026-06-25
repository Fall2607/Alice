require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY || 'alice-super-secret-key-123';

app.use(cors());
app.use(express.json());

// Pastikan folder uploads ada
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Format: tipe-timestamp-namaasli
        const sanitizedFileName = file.originalname.replace(/\s+/g, '_');
        const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;
        cb(null, uniqueFileName);
    }
});

const upload = multer({ storage: storage });

// Middleware Autentikasi API Key
const verifyApiKey = (req, res, next) => {
    const key = req.headers['x-api-key'] || req.query.api_key;
    if (key !== API_KEY) {
        return res.status(403).json({ success: false, message: 'Forbidden: Invalid API Key' });
    }
    next();
};

// Menyajikan folder uploads sebagai file statis (Bisa diakses publik tanpa API Key untuk melihat gambar/CV)
app.use('/uploads', express.static(uploadDir));

// Endpoint Upload (Wajib pakai API Key)
app.post('/api/upload', verifyApiKey, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Return URL Publik (Asumsi server dipanggil dengan IP Publik atau Domain)
        // Kita gunakan header host untuk mengetahui domain/IP yang sedang diakses
        const protocol = req.protocol;
        const host = req.get('host');
        
        // Misal: http://182.253.37.109:4000/uploads/123-file.pdf
        const publicUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: publicUrl,
            name: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'Alice Storage Service' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Storage Server running on port ${PORT}`);
});
