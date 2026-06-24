const express = require('express');
const router = express.Router();

router.use('/auth',       require('./auth.routes'));
router.use('/face',       require('./face.routes'));
router.use('/attendance', require('./attendance.routes'));
router.use('/admin',      require('./admin.routes'));

module.exports = router;
