require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many requests' } }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/face', require('./routes/face'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/admin', require('./routes/admin'));

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Bootstrap admin user
async function seedAdmin() {
  const existing = db.prepare('SELECT id FROM users WHERE email=?').get(process.env.ADMIN_EMAIL);
  if (existing) return;
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  db.prepare(
    'INSERT INTO users (id,name,email,phone,password,role,is_verified) VALUES (?,?,?,?,?,?,1)'
  ).run(uuidv4(), 'Admin', process.env.ADMIN_EMAIL, '0000000000', hash, 'admin');
  console.log(`Admin seeded: ${process.env.ADMIN_EMAIL}`);
}

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, async () => {
  await seedAdmin();
  console.log(`Server running on port ${PORT}`);
});
