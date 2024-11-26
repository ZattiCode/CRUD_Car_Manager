let carData = [];
let currentId = 0;
let carToDelete = null; // Armazena o ID do carro a ser excluído

// Carrega os dados do servidor ao iniciar
function loadData() {
    $.ajax({
        url: 'http://127.0.0.1:3001/cars',
        type: 'GET',
        success: function (response) {
            carData = response;
            if (carData.length > 0) {
                currentId = Math.max(...carData.map(car => car.id)) + 1;
            }
            displayCars();
        },
        error: function () {
            console.log('Erro ao carregar os dados');
        }
    });
}

// Salva os dados no servidor
function saveData(car) {
    $.ajax({
        url: 'http://127.0.0.1:3001/cars',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(car),
        success: function () {
            console.log('Carro salvo com sucesso!');
            loadData(); // Recarrega os dados para refletir as alterações
        },
        error: function () {
            console.log('Erro ao salvar o carro');
        }
    });
}

// Exibe os carros na tabela
function displayCars() {
    const tableBody = $("#carTable");
    tableBody.empty(); // Limpa a tabela

    carData.forEach(car => {
        const carDescription = `${car.brand} ${car.model}`;
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

// Exibe mensagens de alerta no topo da página
function showAlert(message, type) {
    const alertContainer = $("#alertContainer");
    const alertId = `alert-${Date.now()}`; // ID único para o alerta

    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type}">
            ${message}
            <button type="button" class="close" onclick="$('#${alertId}').remove()" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;

    alertContainer.append(alertHTML);

    setTimeout(() => {
        $(`#${alertId}`).fadeOut(300, function () {
            $(this).remove();
        });
    }, 3000);
}

// Adiciona ou atualiza um carro
function addOrUpdateCar(car) {
    const carIndex = carData.findIndex(c => c.id === car.id);
    if (carIndex > -1) {
        carData[carIndex] = car;
        saveData(car);
        showAlert("Carro atualizado com sucesso!", "info");
    } else {
        carData.push(car);
        saveData(car);
        showAlert("Carro adicionado com sucesso!", "success");
    }
    displayCars();
    clearForm();
    $("#submitBtn").data("edit-id", null).val("Adicionar");
}

// Exclui um carro
function deleteCar(carId) {
    $.ajax({
        url: `http://127.0.0.1:3001/cars/${carId}`,
        type: 'DELETE',
        success: function () {
            carData = carData.filter(car => car.id !== carId);
            displayCars();
            showAlert("Carro excluído com sucesso!", "danger");
        },
        error: function () {
            console.log('Erro ao excluir o carro');
        }
    });
}

// Limpa o formulário
function clearForm() {
    $("#carForm")[0].reset(); // Reseta os valores
    $("#carForm .form-control").removeClass("is-valid is-invalid"); // Remove validações
    $("#submitBtn").data("edit-id", null).val("Adicionar");
}

// Valida os campos do formulário
function validateField(field) {
    if (field.val().trim() === "") {
        field.removeClass("is-valid").addClass("is-invalid");
        return false;
    } else {
        field.removeClass("is-invalid").addClass("is-valid");
        return true;
    }
}

// Valida todos os campos do formulário
function validateForm() {
    let isValid = true;

    $("#carForm .form-control").each(function () {
        if (!validateField($(this))) {
            isValid = false;
        }
    });

    return isValid;
}

// Monitora mudanças nos campos para validar em tempo real
$(document).on("input", "#carForm .form-control", function () {
    validateField($(this));
});

// Envio do formulário para adicionar ou atualizar carros
$(document).on("submit", "#carForm", function (e) {
    e.preventDefault();

    if (!validateForm()) {
        showAlert("Preencha todos os campos corretamente antes de enviar.", "danger");
        return;
    }

    const editId = $("#submitBtn").data("edit-id");

    const car = {
        model: $("#carModel").val(),
        brand: $("#carBrand").val(),
        doors: parseInt($("#manyDoors").val(), 10),
        tire: $("#tire").val(),
        year: parseInt($("#carYear").val(), 10),
        gear: $("#carGear").val(),
        id: editId ? parseInt(editId, 10) : currentId++
    };    

    addOrUpdateCar(car);
});

// Ação de edição
$(document).on("click", ".btn-edit", function (e) {
    e.preventDefault();

    const carId = $(this).data("index");
    const car = carData.find(c => c.id === carId);

    if (car) {
        $("#carModel").val(car.model);
        $("#carBrand").val(car.brand);
        $("#manyDoors").val(car.doors);
        $("#tire").val(car.tire);
        $("#carYear").val(car.year);
        $("#carGear").val(car.gear);
        $("#submitBtn").data("edit-id", car.id).val("Salvar");
    }
});

// Exibe a modal de confirmação de exclusão
$(document).on("click", ".btn-delete", function (e) {
    e.preventDefault();
    carToDelete = $(this).data("index"); // Captura o ID do carro
    $("#deleteModal").fadeIn(); // Exibe a modal
});

// Cancela a exclusão e fecha a modal
$(document).on("click", "#cancelDelete", function () {
    carToDelete = null;
    $("#deleteModal").fadeOut();
});

// Confirma a exclusão
$(document).on("click", "#confirmDelete", function () {
    if (carToDelete !== null) {
        deleteCar(carToDelete);
        carToDelete = null;
    }
    $("#deleteModal").fadeOut();
});

// Fecha a modal ao clicar fora do conteúdo
$(document).on("click", "#deleteModal", function (e) {
    if ($(e.target).is("#deleteModal")) {
        carToDelete = null;
        $("#deleteModal").fadeOut();
    }
});

// Inicializa os dados ao carregar a página
$(document).ready(function () {
    $("#deleteModal").hide(); // Garante que a modal está escondida
    loadData();
});