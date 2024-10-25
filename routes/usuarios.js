const express = require('express');
const router = express.Router();


const LoginController = require('../controllers/usuarios-controller');

router.post('/login', LoginController.login);
router.post('/cadastro', LoginController.cadastro);
module.exports = router;