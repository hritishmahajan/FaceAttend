const db = require('../db');

const UserRepository = {
  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id=?').get(id);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email=?').get(email);
  },

  findByEmailOrPhone(email, phone) {
    return db.prepare('SELECT id FROM users WHERE email=? OR phone=?').get(email, phone);
  },

  create({ id, name, email, phone, password, role = 'employee' }) {
    return db.prepare(
      'INSERT INTO users (id,name,email,phone,password,role) VALUES (?,?,?,?,?,?)'
    ).run(id, name, email, phone, password, role);
  },

  markVerified(id) {
    return db.prepare('UPDATE users SET is_verified=1 WHERE id=?').run(id);
  },

  saveFaceDescriptor(id, descriptor, photoFilename) {
    return db.prepare('UPDATE users SET face_descriptor=?, face_photo=? WHERE id=?').run(descriptor, photoFilename, id);
  },

  publicFields(id) {
    return db.prepare('SELECT id,name,email,role,face_descriptor FROM users WHERE id=?').get(id);
  },

  allEmployees() {
    return db
      .prepare('SELECT id,name,email,phone,role,is_verified,face_photo,created_at FROM users WHERE role=?')
      .all('employee');
  },

  createAdmin({ id, name, email, phone, password }) {
    return db.prepare(
      'INSERT INTO users (id,name,email,phone,password,role,is_verified) VALUES (?,?,?,?,?,?,1)'
    ).run(id, name, email, phone, password, 'admin');
  },
};

module.exports = UserRepository;
