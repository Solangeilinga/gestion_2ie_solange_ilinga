const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const ctrl = require('../controllers/anneeAcademiqueController');

router.use(verifyToken);
router.get('/active', ctrl.getActive);
router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getOne);
router.post('/',      ctrl.create);
router.put('/:id',    ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;