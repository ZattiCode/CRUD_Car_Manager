const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = 'car_data.json';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cars', (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Erro ao ler o arquivo, parça' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.post('/cars', (req, res) => {
    const car = req.body;
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Erro ao ler o arquivo, parça' });
        } else {
            let cars = JSON.parse(data);
            const carIndex = cars.findIndex(c => c.id === car.id);

            if (carIndex !== -1) {
                // Atualiza o carro existente
                cars[carIndex] = car;
                res.send({ message: 'Carro atualizado com sucesso!' });
            } else {
                // Adiciona um novo carro
                cars.push(car);
                res.send({ message: 'Carro adicionado com sucesso!' });
            }

            fs.writeFile(DATA_FILE, JSON.stringify(cars, null, 4), (err) => {
                if (err) {
                    res.status(500).send({ error: 'Erro ao salvar os dados' });
                }
            });
        }
    });
});


app.delete('/cars/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Erro ao ler o arquivo' });
        } else {
            let cars = JSON.parse(data);
            const carIndex = cars.findIndex(car => car.id === id);

            if (carIndex !== -1) {
                cars.splice(carIndex, 1);
                fs.writeFile(DATA_FILE, JSON.stringify(cars, null, 4), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Erro ao salvar os dados após exclusão' });
                    } else {
                        res.send({ message: 'Carro excluído com sucesso!' });
                    }
                });
            } else {
                res.status(404).send({ error: 'Carro não encontrado' });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log('Servidor iniciado na porta', PORT);
});