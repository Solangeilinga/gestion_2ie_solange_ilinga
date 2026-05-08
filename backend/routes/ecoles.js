const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const ctrl = require('../controllers/ecolesController');

router.use(verifyToken);
router.get('/',             ctrl.getAll);
router.get('/:id',          ctrl.getOne);
router.get('/:id/filieres', ctrl.getFilieres);
router.post('/',            ctrl.create);
router.put('/:id',          ctrl.update);
router.delete('/:id',       ctrl.remove);

module.exports = router;