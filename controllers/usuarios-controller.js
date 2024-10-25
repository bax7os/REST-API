const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
exports.login = (req, res, next) => {mysql.getConnection((error, conn) => {
    if (error) { return res.status(500).send({ error: error }) }
    conn.query(
        'SELECT * FROM usuarios WHERE email = ?;',
        [req.body.email],
        (error, result, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }); }
            if (result.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            }
            bcrypt.compare(req.body.senha, result[0].senha, (errBcrypt, resultBcrypt) => {
                if(errBcrypt){
                    return res.status(401).send({ mensagem: 'Falha na autenticação' });
                }
                if(resultBcrypt){
                    const token = jwt.sign({
                        id_usuario: result[0].id_usuario,
                        nome: result[0].nome,
                        email: result[0].email
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "5d"
                        }
                    );
                    return res.status(200).send({ 
                        mensagem: 'Sucesso na autenticação',
                        token: token
                     });
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação' });
            });
        }
    )

})};

exports.cadastro = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM usuarios WHERE email = ?;',
            [req.body.email],
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error, response: null }); }
                if (result.length > 0) {
                    return res.status(409).send({ mensagem: 'Ja existe um usuario com esse email' })
                } else {
                    bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                        if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                        conn.query(
                            'INSERT INTO usuarios (nome, email, senha) VALUES (?,?,?)',
                            [req.body.nome, req.body.email, hash],
                            (error, resultado, fields) => {
                                conn.release();
                                if (error) { return res.status(500).send({ error: error, response: null }); }
                                response = {
                                    mensagem: 'Usuário criado com sucesso',
                                    usuarioCriado: {
                                        id_usuario: resultado.insertId,
                                        nome: req.body.nome,
                                        email: req.body.email
                                    }
                                }
                                res.status(201).send(response);
                            }
                        )
                    });
                }
            }
        )

    });
};