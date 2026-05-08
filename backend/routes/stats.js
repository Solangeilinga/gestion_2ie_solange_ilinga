// routes/stats.js
const router      = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const ctrl        = require('../controllers/statsController');

router.use(verifyToken);
router.get('/dashboard', ctrl.getDashboard);

module.exports = router;