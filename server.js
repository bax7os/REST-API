const http = require('http');
const port = process.env.PORT || 3000;
const app = require('./app');
const server = http.createServer(app);
const cors = require('cors');
server.listen(port);

console.log(`Servidor rodando na porta ${port}`);