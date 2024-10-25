const mysql = require('../mysql').pool;



exports.getProdutos = (req, res, next) => { 
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM produtos',
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error, response: null }); }
                const response = {
                    quantidade: result.length,
                    produtos: result.map(produtos => {
                        return {
                            id_produto: produtos.id_produto,
                            nome: produtos.nome,
                            preco: produtos.preco,
                            request: {
                                tipo: 'GET',
                                descrição: 'Retorna os detalhes de um produto específico',
                                url: 'http://localhost:3000/produtos/' + produtos.id_produto
                            }

                        }
                    })
                }
                res.status(201).send({ response });
            }
        )
    })
}

exports.postProdutos = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'INSERT INTO produtos (nome, preco) VALUES (?,?)',
            [req.body.nome, req.body.preco],
            (error, resultado, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error, response: null }); }
                const response = {
                    mensagem: "Inserido com sucesso",
                    produtoCriado: {
                        id_produto: resultado.insertId,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'POST',
                            descrição: 'Insere um produto',
                            url: 'http://localhost:3000/produtos'
                        }
                    }
                }

                res.status(201).send(response);
            }
        )
    });
};

exports.getProdutosById = (req, res, next) => {    mysql.getConnection((error, conn) => {
    if (error) { return res.status(500).send({ error: error }) }
    conn.query(
        'SELECT * FROM produtos WHERE id_produto = ?;',
        [req.params.id_produto],
        (error, result, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error, response: null }); }
            if (result.length == 0) {
                return res.status(404).send({
                    mensagem: 'Não encontrado'
                })
            }

            const response = {
                produto: {

                    id_produto: result[0].id_produto,
                    nome: result[0].nome,
                    preco: result[0].preco,
                    request: {
                        tipo: 'GET',
                        descrição: 'Retorna todos os produtos',
                        url: 'http://localhost:3000/produtos'
                    }


                }
            }
            res.status(200).send({ response });
        }
    )
})};

exports.patchProdutos = (req, res, next) => {mysql.getConnection((error, conn) => {
    if (error) { return res.status(500).send({ error: error }) }
    conn.query(
        'UPDATE produtos SET nome = ?, preco = ? WHERE id_produto = ?',
        [req.body.nome, req.body.preco, req.body.id_produto],
        (error, resultado, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error, response: null }); }

            res.status(201).send({
                mensagem: 'GET'
            });
        }
    )
})};

exports.deleteProdutos = (req, res, next) => { mysql.getConnection((error, conn) => {
    if (error) { return res.status(500).send({ error: error }) }
    conn.query(
        'DELETE FROM produtos WHERE id_produto = ?', 
        [req.body.id_produto],
        (error, resultado, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error, response: null }); }
            const response = {
                mensagem: "Deletado com sucesso",
                    request: {
                        tipo: 'DELETE',
                        descrição: 'Retorna todos os produtos',
                        url: 'http://localhost:3000/produtos',
                        body:{
                            nome: 'String',
                            preco: 'Number'
                        }
                    }

                }
                res.status(201).send({ response });
                
            
        }
    )
})};