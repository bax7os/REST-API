const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(201).send('get');
    mensagem: 'GET!'
});

router.post('/', (req, res, next) => {
    const produto = {
        nome: req.body.nome,
        preco: req.body.preco
    }

    res.status(201).send('post');
    mensagem: 'POST'
});


router.get('/:id', (req, res, next) => {
    const id = req.params.id;

    if (id === 'especial') {
        res.status(201).send({
            mensagem: 'DELETE'
            });
        ;
    } else {
        res.status(201).send({
            mensagem: 'DELETE'
            });
        ;
    }

    res.status(201).send({
        mensagem: 'DELETE'
        });
    

})

router.patch('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'DELETE'
        });
    
});
router.delete('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'DELETE'
        });
    
});



module.exports = router;