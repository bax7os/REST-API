const mysql = require('../mysql').pool;

// Get all treinos (all professors)
exports.getTreinos = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM treino',
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error, response: null }); }
                const response = {
                    quantidade: result.length,
                    treinos: result.map(treino => {
                        return {
                            id_treino: treino.id_treino,
                            tipo: treino.tipo,
                            descricao: treino.descricao,
                            alvo: treino.alvo,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os detalhes de um treino específico',
                                url: 'http://localhost:3000/treinos/' + treino.id_treino
                            }
                        }
                    })
                }
                res.status(200).send(response);
            }
        )
    });
};

// Get treino by ID
exports.getTreinoById = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM treino WHERE id_treino = ?',
            [req.params.id_treino],
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error, response: null }); }
                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não encontrado'
                    })
                }
                const response = {
                    treino: {
                        id_treino: result[0].id_treino,
                        tipo: result[0].tipo,
                        descricao: result[0].descricao,
                        alvo: result[0].alvo,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os treinos',
                            url: 'http://localhost:3000/treinos'
                        }
                    }
                }
                res.status(200).send(response);
            }
        )
    });
};


// Create a new treino
exports.postTreinos = (req, res, next) => {
    const { tipo, descricao, alvo } = req.body;
    const professor_id = req.usuario.id_usuario; // Certifique-se de usar o ID do usuário correto

    console.log('Início da função postTreinos');

    mysql.getConnection((error, conn) => {
        if (error) {
            console.log('Erro ao obter conexão com o banco de dados:', error);
            return res.status(500).send({ error: error });
        }

        console.log('Conexão com o banco de dados estabelecida');

        conn.query(
            'INSERT INTO treino (tipo, descricao, alvo) VALUES (?, ?, ?)',
            [tipo, descricao, alvo],
            (error, resultado, fields) => {
                conn.release();
                if (error) {
                    console.log('Erro ao inserir dados no banco de dados:', error);
                    return res.status(500).send({ error: error, response: null });
                }

                console.log('Dados inseridos com sucesso no banco de dados');

                const treino_id = resultado.insertId;

                // Insert into professor_treino
                conn.query(
                    'INSERT INTO treino_has_usuarios (usuarios_id_usuario, treino_id_treino) VALUES (?, ?)',
                    [professor_id, treino_id],
                    (error, resultado, fields) => {
                  
                        if (error) {
                            console.log('Erro ao inserir dados no banco de dados (treino_has_usuarios):', error);
                            return res.status(500).send({ error: error, response: null });
                        }

                        console.log('Dados inseridos com sucesso no banco de dados (treino_has_usuarios)');

                        const response = {
                            mensagem: "Treino criado com sucesso",
                            treinoCriado: {
                                id_treino: treino_id,
                                tipo: tipo,
                                descricao: descricao,
                                alvo: alvo,
                                request: {
                                    tipo: 'POST',
                                    descricao: 'Cria um treino',
                                    url: 'http://localhost:3000/treinos/' + treino_id
                                }
                            }
                        }

                        console.log('Função postTreinos concluída com sucesso');

                        res.status(201).send(response);
                    }
                );
            }
        );
    });
};

exports.patchTreinos = (req, res, next) => {
    const { tipo, descricao, alvo } = req.body;
    const id_treino = req.params.id_treino;

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'UPDATE treino SET tipo = ?, descricao = ?, alvo = ? WHERE id_treino = ?',
            [tipo, descricao, alvo, id_treino],
            (error, resultado, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error, response: null }); }
                if (resultado.affectedRows === 0) {
                    return res.status(404).send({ mensagem: 'Treino não encontrado' });
                }
                res.status(200).send({
                    mensagem: 'Treino atualizado com sucesso',
                    treinoAtualizado: {
                        id_treino: id_treino,
                        tipo: tipo,
                        descricao: descricao,
                        alvo: alvo,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna os detalhes de um treino específico',
                            url: 'http://localhost:3000/treinos/' + id_treino
                        }
                    }
                });
            }
        );
    });
};

exports.deleteTreinos = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        // Primeiro, remover todas as referências na tabela treino_has_usuarios
        conn.query(
            'DELETE FROM treino_has_usuarios WHERE treino_id_treino = ?',
            [req.params.id_treino],
            (error, resultado, fields) => {
                if (error) {
                    console.error('Erro ao deletar relacionamento:', error);
                    return res.status(500).send({ error: error, response: null });
                }
                // Em seguida, deletar o treino
                conn.query(
                    'DELETE FROM treino WHERE id_treino = ?',
                    [req.params.id_treino],
                    (error, resultado, fields) => {
                        conn.release();
                        if (error) {
                            console.error('Erro ao deletar treino:', error);
                            return res.status(500).send({ error: error, response: null });
                        }
                        if (resultado.affectedRows === 0) {
                            return res.status(404).send({ mensagem: 'Treino não encontrado' });
                        }
                        const response = {
                            mensagem: 'Treino deletado com sucesso',
                            request: {
                                tipo: 'DELETE',
                                descricao: 'Deleta um treino',
                                url: `http://localhost:3000/treinos/${req.params.id_treino}`,
                                body: {
                                    tipo: 'String',
                                    descricao: 'String',
                                    alvo: 'String'
                                }
                            }
                        }
                        res.status(200).send(response);
                    }
                );
            }
        );
    });
};
