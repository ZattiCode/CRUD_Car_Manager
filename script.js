//pra que serve
//tantos códigos?
//se a vida
//não é programada
//e as melhores coisas
//não tem lógica.

let carData = [];
let currentId = 0;

// carrega os dados do car_data.json ao iniciar
function loadData() {
    $.ajax({
        url: 'http://127.0.0.1:3000/cars',
        type: 'GET',
        success: function (response) {
            carData = response;
            if (carData.length > 0) {
                currentId = Math.max(...carData.map(car => car.id)) + 1;
            }
            displayCars();
        },
        error: function () {
            console.log('Deu erro para carregar os dados');
        }
    });
}

// salva os dados no car_data.json
function saveData() {
    $.ajax({
        url: 'http://127.0.0.1:3000/cars',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(carData),
        success: function () {
            console.log('Dados salvos com sucesso');
        },
        error: function () {
            console.log('Erro ao salvar os dados');
        }
    });
}

// exibe os dados na tabela
function displayCars() {
    const tableBody = $("#carTable");
    tableBody.empty(); // limpa o conteúdo atual da tabela

    carData.forEach(car => {
        const carDescription = `${car.brand} ${car.model}`; // marca + modelo
        const row = `
            <tr>
                <td>${car.id}</td>
                <td>${carDescription}</td>
                <td>${car.doors}</td>
                <td>${car.tire}</td>
                <td>${car.year}</td>
                <td>${car.gear}</td>
                <td class="actions">
                    <a href="#" class="btn-edit" data-index="${car.id}">EDITAR</a>
                    <a href="#" class="btn-delete" data-index="${car.id}">DELETAR</a>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
}

// adicionar um carro novo
function addCar(car) {
    car.id = currentId++; // incrementa o ID único
    carData.push(car); // adiciona ao array
    saveData(); // salva no car_data.json
    displayCars(); // atualiza a tabela
    clearForm(); // limpa o formulário
}

// atualizar um carro já existente
function updateCar(index, updatedCar) {
    const carIndex = carData.findIndex(car => car.id === index);
    if (carIndex !== -1) {
        updatedCar.id = carData[carIndex].id; // mantém o ID
        carData[carIndex] = updatedCar;
        saveData(); // salva no car_data.json
        displayCars(); // atualiza a tabela
        clearForm(); // reseta o formulário
        $("#submitBtn").val("Adicionar").removeData("editingIndex");
    }
}

// excluir um carro
function deleteCar(index) {
    carData = carData.filter(car => car.id !== index);
    saveData(); // salva no car_data.json
    displayCars(); // atualiza tabela
}

// limpar formulário
function clearForm() {
    $("#carModel").val("");
    $("#carBrand").val("");
    $("#manyDoors").val("");
    $("#tire").val("");
    $("#carYear").val("");
    $("#carGear").val("");
    $("#submitBtn").val("Adicionar").removeData("editingIndex");
}

// enviar o formulário com validação de campos
$("#submitBtn").on("click", function (e) {
    e.preventDefault();
    let enviaForm = true;

    // validação individual dos campos
    if ($("#carModel").val() == null || $("#carModel").val().trim() === "") {
        alert("Tá faltando o modelo do carro, viu?");
        enviaForm = false;
    }
    if ($("#carBrand").val() == null || $("#carBrand").val().trim() === "") {
        alert("Tá faltando a marca do carro, viu?");
        enviaForm = false;
    }
    if ($("#manyDoors").val() == null || $("#manyDoors").val().trim() === "") {
        alert("Tá faltando o número de portas, viu?");
        enviaForm = false;
    }
    if ($("#tire").val() == null || $("#tire").val().trim() === "") {
        alert("Tá faltando o estepe, viu?");
        enviaForm = false;
    }
    if ($("#carYear").val() == null || $("#carYear").val().trim() === "") {
        alert("Tá faltando o ano do carro, viu?");
        enviaForm = false;
    }
    if ($("#carGear").val() == null || $("#carGear").val().trim() === "") {
        alert("Tá faltando o câmbio do carro, viu?");
        enviaForm = false;
    }

    // envia, se todos os campos estiverem preenchidos
    if (enviaForm === true) {
        const editingIndex = $("#submitBtn").data("editingIndex");
        if (editingIndex !== undefined) { //verifica se esta no modo edição
            
            const updatedCar = {
                id: editingIndex,
                model: $("#carModel").val(),
                brand: $("#carBrand").val(),
                doors: parseInt($("#manyDoors").val()),
                tire: $("#tire").val(),
                year: parseInt($("#carYear").val()),
                gear: $("#carGear").val()
            };

            updateCar(editingIndex, updatedCar); //atualiza o carro no array e no backend
        } else {
            const newCar = { //cria um objeto para um carro novo
                model: $("#carModel").val(),
                brand: $("#carBrand").val(),
                doors: parseInt($("#manyDoors").val()),
                tire: $("#tire").val(),
                year: parseInt($("#carYear").val()),
                gear: $("#carGear").val()
            };

            addCar(newCar);
        }

        clearForm();
    }
});

// edição, sério??
$(document).on("click", ".btn-edit", function (e) {
    e.preventDefault();
    const index = parseInt($(this).data("index"));
    const car = carData.find(car => car.id === index);
    if (car) {
        $("#carModel").val(car.model);
        $("#carBrand").val(car.brand);
        $("#manyDoors").val(car.doors);
        $("#tire").val(car.tire);
        $("#carYear").val(car.year);
        $("#carGear").val(car.gear);
        $("#submitBtn").val("Atualizar").data("editingIndex", index);
    }
});

// excluir, ava
$(document).on("click", ".btn-delete", function (e) {
    e.preventDefault();
    const index = parseInt($(this).data("index"));
    deleteCar(index);
});

// carregar dados ao iniciar
$(document).ready(function () {
    loadData();
});
