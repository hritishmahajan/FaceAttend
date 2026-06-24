const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'attendance.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    phone       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'employee',
    face_descriptor TEXT,
    face_photo  TEXT,
    is_verified INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS otps (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    otp        TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used       INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    date       TEXT NOT NULL,
    punch_in   TEXT,
    punch_out  TEXT,
    punch_in_photo  TEXT,
    punch_out_photo TEXT,
    lat        REAL,
    lng        REAL,
    status     TEXT NOT NULL DEFAULT 'present',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

module.exports = db;
