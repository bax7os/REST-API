const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const treinosController = require('../controllers/treinos-controller');


router.get('/', login.obrigatorio, treinosController.getTreinos);
router.post('/', login.obrigatorio, treinosController.postTreinos);
router.get('/:id_treino', login.obrigatorio, treinosController.getTreinoById);
router.patch('/:id_treino', login.obrigatorio, treinosController.patchTreinos);
router.delete('/:id_treino', login.obrigatorio,treinosController.deleteTreinos);
module.exports = router;