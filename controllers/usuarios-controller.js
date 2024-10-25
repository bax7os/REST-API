const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.cadastro = (req, res, next) => {
    console.log("Requisição recebida Cadastro");
    
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).send({ error: "Todos os campos são obrigatórios" });
    }

    mysql.getConnection((error, conn) => {
        if (error) {
            console.error("Erro ao obter conexão do banco de dados:", error);
            return res.status(500).send({ error: error });
        }
        conn.query(
            'SELECT * FROM usuarios WHERE email = ?;',
            [email],
            (error, result, fields) => {
                if (error) {
                    console.error("Erro ao consultar usuários:", error);
                    conn.release();
                    return res.status(500).send({ error: error, response: null });
                }
                if (result.length > 0) {
                    console.warn("Email já existente:", email);
                    conn.release();
                    return res.status(409).send({ mensagem: 'Já existe um usuário com esse email' });
                } else {
                    bcrypt.hash(senha, 10, (errBcrypt, hash) => {
                        if (errBcrypt) {
                            console.error("Erro ao hashear a senha:", errBcrypt);
                            return res.status(500).send({ error: errBcrypt });
                        }
                        conn.query(
                            'INSERT INTO usuarios (nome, email, senha) VALUES (?,?,?)',
                            [nome, email, hash],
                            (error, resultado, fields) => {
                                conn.release();
                                if (error) {
                                    console.error("Erro ao inserir usuário:", error);
                                    return res.status(500).send({ error: error, response: null });
                                }
                                const response = {
                                    mensagem: 'Usuário criado com sucesso',
                                    usuarioCriado: {
                                        id_usuario: resultado.insertId,
                                        nome: nome,
                                        email: email
                                    }
                                };
                                console.log("Usuário criado com sucesso:", response);
                                res.status(201).send(response);
                            }
                        );
                    });
                }
            }
        );
    });
};

exports.login = (req, res, next) => {mysql.getConnection((error, conn) => {
   console.log("Requisição recebida Login");
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