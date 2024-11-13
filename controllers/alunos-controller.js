const mysql = require('../mysql').pool;


exports.getAlunos = (req, res, next) => { 
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM alunos WHERE usuarios_id_usuario = ?',
            [req.usuario.id_usuario], // Usa o ID do usuário logado
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error, response: null }); }
                const response = {
                    quantidade: result.length,
                    alunos: result.map(aluno => {
                        return {
                            id_aluno: aluno.id_aluno,
                            nome: aluno.nome,
                            idade: aluno.idade,
                            cpf: aluno.cpf,
                            data_de_cadastro: aluno.data_de_cadastro,
                            comorbidade: aluno.comorbidade,
                            request: {
                                tipo: 'GET',
                                descrição: 'Retorna os detalhes de um aluno específico',
                                url: 'http://localhost:3000/alunos/' + aluno.id_aluno
                            }
                        }
                    })
                }
                res.status(200).send(response);
            }
        )
    })
};


exports.postAlunos = (req, res, next) => {
    console.log("requisição postALunos");
    const { nome, idade, cpf, data_de_cadastro, comorbidade } = req.body;
    const usuarios_id_usuario = req.usuario.id_usuario;
    if (!usuarios_id_usuario) {
      return res.status(400).send({ error: "Usuário não autenticado" });
    }

    if (!nome || !idade || !cpf || !data_de_cadastro || !comorbidade) {
        return res.status(400).send({ error: "Todos os campos são obrigatórios" });
    }
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error("Erro ao obter conexão do banco de dados:", error);
            return res.status(500).send({ error: error });
        }
        conn.query(
            'INSERT INTO alunos (nome, idade, cpf, data_de_cadastro, comorbidade, usuarios_id_usuario) VALUES (?,?,?,?,?,?)',
            [nome, idade, cpf, data_de_cadastro, comorbidade, usuarios_id_usuario],
            (error, resultado, fields) => {
                conn.release();
                if (error) { 
                    console.error("Erro ao inserir usuário:", error);
                    return res.status(500).send({ error: error, response: null });
                }  
                const response = {
                    mensagem: "Aluno inserido com sucesso",
                    alunoCriado: {
                        id_aluno: resultado.insertId,
                        nome: nome,
                        idade: idade,
                        cpf: cpf,
                        data_de_cadastro: data_de_cadastro,
                        comorbidade: comorbidade,
                        request: {
                            tipo: 'POST',
                            descrição: 'Insere um aluno',
                            url: 'http://localhost:3000/alunos'
                        }
                    }
                }
                res.status(201).send(response);
            }
        )
    });
};

exports.getAlunosById = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM alunos WHERE id_aluno = ? AND usuarios_id_usuario = ?',
            [req.params.id_aluno, req.usuario.id_usuario], // Certifique-se de usar req.usuario.id_usuario
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error, response: null }); }
                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não encontrado'
                    })
                }
                const response = {
                    aluno: {
                        id_aluno: result[0].id_aluno,
                        nome: result[0].nome,
                        idade: result[0].idade,
                        cpf: result[0].cpf,
                        data_de_cadastro: result[0].data_de_cadastro,
                        comorbidade: result[0].comorbidade,
                        request: {
                            tipo: 'GET',
                            descrição: 'Retorna todos os alunos',
                            url: 'http://localhost:3000/alunos'
                        }
                    }
                }
                res.status(200).send(response);
            }
        )
    });
};


exports.patchAlunos = (req, res, next) => {
    const { nome, idade, cpf, data_de_cadastro, comorbidade } = req.body;
    const id_aluno = req.params.id_aluno;
    const usuarios_id_usuario = req.usuario.id_usuario;
    const formattedDate = data_de_cadastro.split('T')[0];
    

    if (!id_aluno) {
        console.error("ID do aluno não fornecido"); // Log de erro: ID do aluno não fornecido
        return res.status(400).send({ error: "ID do aluno não fornecido" });
    }

    mysql.getConnection((error, conn) => {
        if (error) {
            console.error("Falha ao conectar ao banco de dados:", error); // Log de erro: Falha ao conectar ao banco de dados
            return res.status(500).send({ error: error });
        }
        conn.query(
            'UPDATE alunos SET nome = ?, idade = ?, cpf = ?, data_de_cadastro = ?, comorbidade = ? WHERE id_aluno = ? AND usuarios_id_usuario = ?',
            [nome, idade, cpf, data_de_cadastro, comorbidade, id_aluno, usuarios_id_usuario],
            (error, resultado, fields) => {
                conn.release();
                if (error) {
                    console.error("Falha ao executar a query de atualização:", error); // Log de erro: Falha ao executar a query de atualização
                    return res.status(500).send({ error: error, response: null });
                }
                if (resultado.affectedRows === 0) {
                    console.error("Aluno não encontrado"); // Log de erro: Aluno não encontrado
                    return res.status(404).send({ error: "Aluno não encontrado" });
                }
                console.log("Aluno atualizado com sucesso"); // Log de sucesso: Aluno atualizado com sucesso
                res.status(201).send({
                    mensagem: 'Aluno atualizado com sucesso',
                    alunoAtualizado: {
                        id_aluno: id_aluno,
                        nome: nome,
                        idade: idade,
                        cpf: cpf,
                        data_de_cadastro: formattedDate,
                        comorbidade: comorbidade,
                        request: {
                            tipo: 'PATCH',
                            descricao: 'Atualiza um aluno',
                            url: 'http://localhost:3000/alunos/' + id_aluno
                        }
                    }
                });
            }
        );
    });
};

exports.deleteAlunos = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'DELETE FROM alunos WHERE id_aluno = ? AND usuarios_id_usuario = ?', 
            [req.params.id_aluno, req.usuario.id_usuario], // Use req.params.id_aluno instead of req.body.id_aluno
            (error, resultado, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error, response: null }); }
                const response = {
                    mensagem: "Aluno deletado com sucesso",
                    request: {
                        tipo: 'DELETE',
                        descricao: 'Deleta um aluno',
                        url: `http://localhost:3000/alunos/${req.params.id_aluno}`, // Use req.params.id_aluno in the URL
                        body: {
                            id_aluno: 'Number',
                            nome: 'String',
                            idade: 'Number',
                            cpf: 'String',
                            data_de_cadastro: 'Date',
                            comorbidade: 'String'
                        }
                    }
                }
                res.status(200).send(response);
            }
        )
    });
};