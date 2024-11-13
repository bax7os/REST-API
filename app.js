const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');


const rota_alunos = require('./routes/alunos');
const rota_usuarios = require('./routes/usuarios');
const rota_treinos = require('./routes/treinos');




app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false })); // apenas dados simples
app.use(bodyParser.json());
app.use(cors({origin: true, credentials: true}));
app.use('/alunos', rota_alunos);
app.use('/usuarios', rota_usuarios);
app.use('/treinos', rota_treinos);


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
