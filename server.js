    const express = require('express'); //importa o express (criar/gerenciar) server
    const fs = require('fs'); //importa fs (leitura/escrita) de arquivos
    const bodyParser = require('body-parser');  //importa body-parser (interpretar) requisiçoes JSON

    const app = express(); // configurar rotas middleware (body-parser)
    const path = require('path');
    const PORT = 3000; // não preciso falar né
    const DATA_FILE = 'car_data.json'; // nome do arquivo dos carros salvos

    //--------------------------------------------------------------------------------//

    /*var http = require("http");

    http
        .createServer(function (req, res) {
            res.writeHead(200, {"Content-Type": "text/plain"});

            res.end("Olá mundo\n");
        })
    .listen(3000, "127.0.0.1")*/
    //--------------------------------------------------------------------------------//

    app.use(bodyParser.json()); // ativar o (body-parser)
    app.use(express.static(path.join(__dirname))); // html, css , js...

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    // rota get para buscar os dados dos carros
    app.get('/cars', (req, res) => {
        fs.readFile(DATA_FILE, (err, data) => {
            if (err) {
                res.status(500).send({ error: 'Erro ao ler o arquivo, parça' });
            } else {
                res.json(JSON.parse(data));
            }
        });
    });

    // rota post para salvar os dados dos carros
    app.post('/cars', (req, res) => {
        const cars = req.body; // dados recebidos
        fs.writeFile(DATA_FILE, JSON.stringify(cars, null, 4), (err) => {
            if (err) {
                res.status(500).send({ error: 'Erro ao salvar os dados, irmão' });
            } else {
                res.send({ message: 'Certinho, dados salvos' });
            }
        });
    });


    // inicia o server
    app.listen(PORT, () => {
        console.log('porta do servidor', PORT);
    });