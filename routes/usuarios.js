const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const userController = require('../controllers/usuarios-controller');

router.post('/login', userController.login);
router.post('/', userController.cadastro);

router.get('/user',  login.obrigatorio, userController.getUser);
module.exports = router;