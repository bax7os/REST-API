const express = require('express');
const app = express();
const morgan = require('morgan');
const rotas = require('./routes/produtos');
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false })); // apenas dados simples
app.use(bodyParser.json());
app.use('/produtos', rotas);


// quando não encontra rota
app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);    

});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        erro: {
            mensagem: error.message
        }
    });
});

module.exports = app;
