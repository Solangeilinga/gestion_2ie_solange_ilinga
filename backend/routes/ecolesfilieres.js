const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const ctrl = require('../controllers/ecolesFiliereController');

router.use(verifyToken);
router.get('/',                           ctrl.getAll);
router.post('/',                          ctrl.create);
router.put('/:ecoles_id/:filieres_id',    ctrl.update);
router.delete('/:ecoles_id/:filieres_id', ctrl.remove);

module.exports = router;