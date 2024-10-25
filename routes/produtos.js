const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const ProdutosController = require('../controllers/produtos-controller');


router.get('/', ProdutosController.getProdutos);
router.post('/', login.obrigatorio, ProdutosController.postProdutos);
router.get('/:id_produto', ProdutosController.getProdutosById);
router.patch('/:id_produto', ProdutosController.patchProdutos);
router.delete('/:id_produto', login.obrigatorio,ProdutosController.deleteProdutos);
module.exports = router;