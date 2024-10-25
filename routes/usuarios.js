const express = require('express');
const router = express.Router();


const userController = require('../controllers/usuarios-controller');

router.post('/login', userController.login);
router.post('/', userController.cadastro);
module.exports = router;