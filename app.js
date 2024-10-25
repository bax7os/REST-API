const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');


const rota_produtos = require('./routes/produtos');
const rota_usuarios = require('./routes/usuarios');



app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false })); // apenas dados simples
app.use(bodyParser.json());
app.use(cors({origin: true, credentials: true}));
app.use('/produtos', rota_produtos);
app.use('/usuarios', rota_usuarios);


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
