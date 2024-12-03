const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3001;
const DATA_FILE = "car_data.json";

// Configuração do Multer para upload de imagens
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Rota para servir o HTML inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Rota para obter todos os carros
app.get("/cars", (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      res.status(500).send({ error: "Erro ao ler o arquivo." });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Rota para adicionar um carro com upload de imagem e IDs sequenciais
app.post("/cars", upload.single("foto"), (req, res) => {
  const { model, brand, year, doors, tire, gear } = req.body;
  const newCar = {
    model,
    brand,
    year: parseInt(year, 10),
    doors: parseInt(doors, 10),
    tire,
    gear,
    photo: req.file ? `uploads/${req.file.filename}` : null,
  };

  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      return res.status(500).send({ error: "Erro ao ler o arquivo." });
    }

    const cars = JSON.parse(data);

    // Definir o ID como o próximo número sequencial
    newCar.id = cars.length > 0 ? cars[cars.length - 1].id + 1 : 1;

    cars.push(newCar);

    fs.writeFile(DATA_FILE, JSON.stringify(cars, null, 4), (err) => {
      if (err) {
        return res.status(500).send({ error: "Erro ao salvar os dados." });
      }
      res
        .status(201)
        .json({ message: "Carro adicionado com sucesso!", car: newCar });
    });
  });
});

// Rota para excluir um carro
app.delete("/cars/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      return res.status(500).send({ error: "Erro ao ler o arquivo." });
    }

    const cars = JSON.parse(data);
    const carIndex = cars.findIndex((car) => car.id === id);

    if (carIndex !== -1) {
      cars.splice(carIndex, 1);

      fs.writeFile(DATA_FILE, JSON.stringify(cars, null, 4), (err) => {
        if (err) {
          return res
            .status(500)
            .send({ error: "Erro ao salvar os dados após exclusão." });
        }
        res.send({ message: "Carro excluído com sucesso!" });
      });
    } else {
      res.status(404).send({ error: "Carro não encontrado." });
    }
  });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
