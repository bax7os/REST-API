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
                                if (error) {        if (error) { return res.status(500).send({ error: error }) }

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


exports.login = (req, res, next) => {
    console.log("Requisição recebida Login");
    
    const { email, senha } = req.body;
    console.log(email, senha);
    if (!email || !senha) {
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
                conn.release();
                if (error) {
                    console.error("Erro ao consultar usuários:", error);
                    return res.status(500).send({ error: error });
                }
                if (result.length < 1) {
                    console.warn("Falha na autenticação: usuário não encontrado");
                    return res.status(401).send({ mensagem: 'Falha na autenticação' });
                }
                bcrypt.compare(senha, result[0].senha, (errBcrypt, resultBcrypt) => {
                    if (errBcrypt) {
                        console.error("Erro ao comparar senhas:", errBcrypt);
                        return res.status(401).send({ mensagem: 'Falha na autenticação' });
                    }
                    if (resultBcrypt) {
                        const token = jwt.sign({
                            id_usuario: result[0].id_usuario,
                            nome: result[0].nome,
                            email: result[0].email
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "5d"
                        });
                        console.log("Autenticação bem-sucedida:", result[0]);
                        return res.status(200).send({ 
                            mensagem: 'Sucesso na autenticação',
                            token: token 
                        });
                    }
                    console.warn("Falha na autenticação: senha incorreta");
                    return res.status(401).send({ mensagem: 'Falha na autenticação' });
                });
            }
        );
    });
};

exports.getUser = (req, res, next) => {
    console.log("Requisição recebida getUser");
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query(
            'SELECT * FROM usuarios WHERE id_usuario = ?',
            [req.usuario.id_usuario],
            (error, result, fields) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error });
                }
                if (result.length < 1) {
                    return res.status(404).send({ mensagem: 'Usuário não encontrado' });
                }
                const user = {
                    id_usuario: result[0].id_usuario,
                    nome: result[0].nome,
                    email: result[0].email
                };
                res.status(200).send({ user: user });
            }
        );
    });
};
