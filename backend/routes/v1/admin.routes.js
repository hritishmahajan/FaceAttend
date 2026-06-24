const express = require('express');
const path = require('path');
const { authMiddleware, adminOnly } = require('../../middleware/auth');
const AdminService = require('../../services/admin.service');
const { AppError } = require('../../middleware/errorHandler');

const router = express.Router();

router.use(authMiddleware, adminOnly);

router.get('/stats', (req, res, next) => {
  try {
    const date = req.query.date ?? new Date().toISOString().slice(0, 10);
    res.json(AdminService.getStats(date));
  } catch (err) { next(err); }
});

router.get('/attendance', (req, res, next) => {
  try {
    res.json(AdminService.getAttendance({ date: req.query.date, userId: req.query.userId }));
  } catch (err) { next(err); }
});

router.get('/attendance/:id', (req, res, next) => {
  try {
    const record = AdminService.getAttendanceRecord(req.params.id);
    if (!record) return next(new AppError('Record not found', 404));
    res.json(record);
  } catch (err) { next(err); }
});

router.get('/employees', (req, res, next) => {
  try {
    res.json(AdminService.getEmployees());
  } catch (err) { next(err); }
});

router.get('/photo/:filename', (req, res) => {
  const file = path.join(__dirname, '../../uploads', req.params.filename);
  res.sendFile(file, err => {
    if (err) res.status(404).json({ error: 'Photo not found' });
  });
});

router.get('/geofence', (req, res, next) => {
  try {
    res.json(AdminService.getGeofenceConfig());
  } catch (err) { next(err); }
});

module.exports = router;
