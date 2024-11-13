const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const alunosController = require('../controllers/alunos-controller');


router.get('/', login.obrigatorio, alunosController.getAlunos);
router.post('/', login.obrigatorio, alunosController.postAlunos);
router.get('/:id_aluno', login.obrigatorio, alunosController.getAlunosById);
router.patch('/:id_aluno', login.obrigatorio, alunosController.patchAlunos);
router.delete('/:id_aluno', login.obrigatorio,alunosController.deleteAlunos);
module.exports = router;