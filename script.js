let carData = [];
let currentId = 0;
let carToDelete = null; // Armazena o ID do carro a ser
let currentPage = 1;
const itemsPerPage = 10;

// Carrega os dados do servidor ao iniciar
function loadData() {
  $.ajax({
    url: "http://127.0.0.1:3001/cars",
    type: "GET",
    success: function (response) {
      carData = response;
      if (carData.length > 0) {
        currentId = Math.max(...carData.map((car) => car.id)) + 1;
      }
      currentPage = 1;
      displayCars();
    },
    error: function () {
      console.log("Erro ao carregar os dados");
    },
  });
}

// Salva os dados no servidor
function saveData(car) {
  const formData = new FormData();
  for (const key in car) {
    formData.append(key, car[key]);
  }
  const fotoInput = document.querySelector("#carImage"); // Atualize para o ID correto
  if (fotoInput.files[0]) {
    formData.append("foto", fotoInput.files[0]);
  }

  $.ajax({
    url: "http://127.0.0.1:3001/cars",
    type: "POST",
    processData: false,
    contentType: false,
    data: formData,
    success: function () {
      loadData(); // Recarrega a tabela
      clearForm(); // Limpa o formulário
      showAlert("Carro salvo com sucesso!", "success");
    },
    error: function () {
      showAlert("Erro ao salvar o carro.", "danger");
    },
  });
}

// Exibe os carros na tabela
function displayCars() {
  const tableBody = $("#carTable");
  tableBody.empty();

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const carsToDisplay = carData.slice(start, end);

  carsToDisplay.forEach((car) => {
    const carDescription = `${car.brand} ${car.model}`;
    const row = `
      <tr>
        <td>${car.id}</td>
        <td>${carDescription}</td>
        <td>${car.doors}</td>
        <td>${car.tire}</td>
        <td>${car.year}</td>
        <td>${car.gear}</td>
        <td>
          ${
            car.photo
              ? `<img src="${car.photo}" alt="Carro" class="car-image">`
              : "Sem imagem"
          }
        </td>
        <td class="actions">
          <a href="#" class="btn-edit" data-index="${car.id}">EDITAR</a>
          <a href="#" class="btn-delete" data-index="${car.id}">DELETAR</a>
        </td>
      </tr>
    `;
    tableBody.append(row);
  });

  updatePagination();
}

function searchCars() {
  const searchTerm = $("#searchInput").val().toLowerCase();
  const filteredCars = carData.filter(
    (car) =>
      car.model.toLowerCase().includes(searchTerm) ||
      car.brand.toLowerCase().includes(searchTerm)
  );
  displayFilteredCars(filteredCars);
}

function updatePagination() {
  const paginationContainer = $("#pagination");
  paginationContainer.empty();

  const totalPages = Math.ceil(carData.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = `<button class="page-btn" data-page="${i}">${i}</button>`;
    paginationContainer.append(button);
  }

  // Marca a página atual como ativa
  $(`.page-btn[data-page="${currentPage}"]`).addClass("active");
}

function displayFilteredCars(filteredCars) {
  const tableBody = $("#carTable");
  tableBody.empty(); // Limpa a tabela

  filteredCars.forEach((car) => {
    const carDescription = `${car.brand} ${car.model}`;
    const row = `
          <tr>
              <td>${car.id}</td>
              <td>${carDescription}</td>
              <td>${car.doors}</td>
              <td>${car.tire}</td>
              <td>${car.year}</td>
              <td>${car.gear}</td>
              <td>
                  ${
                    car.photo
                      ? `<img src="${car.photo}" class="car-image" alt="Carro">`
                      : "Sem imagem"
                  }
              </td>
              <td class="actions">
                  <a href="#" class="btn-edit" data-index="${car.id}">EDITAR</a>
                  <a href="#" class="btn-delete" data-index="${
                    car.id
                  }">DELETAR</a>
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
  const carIndex = carData.findIndex((c) => c.id === car.id);
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
    type: "DELETE",
    success: function () {
      carData = carData.filter((car) => car.id !== carId);
      displayCars();
      showAlert("Carro excluído com sucesso!", "danger");
    },
    error: function () {
      console.log("Erro ao excluir o carro");
    },
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
    showAlert(
      "Preencha todos os campos corretamente antes de enviar.",
      "danger"
    );
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
    id: editId ? parseInt(editId, 10) : currentId++,
  };

  addOrUpdateCar(car);
});

// Ação de edição
$(document).on("click", ".btn-edit", function (e) {
  e.preventDefault();

  const carId = $(this).data("index");
  const car = carData.find((c) => c.id === carId);

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

//Procurar carro
$(document).on("click", "#searchBtn", function () {
  searchCars();
});

// Selecionar a pagina
$(document).on("click", ".page-btn", function () {
  const selectedPage = parseInt($(this).data("page"), 10);
  if (selectedPage !== currentPage) {
    currentPage = selectedPage;
    displayCars();
  }
});

$(document).on("input", "#searchInput", function () {
  const searchTerm = $(this).val().toLowerCase();
  const filterBy = $("#filterDropdown").val();

  if (searchTerm === "") {
    displayCars(); // Volta à tabela completa
  } else {
    const filteredCars = carData.filter((car) => {
      switch (filterBy) {
        case "model":
          return car.model.toLowerCase().includes(searchTerm);
        case "year":
          return car.year.toString().includes(searchTerm);
        case "gear":
          return car.gear.toLowerCase().includes(searchTerm);
        case "brand":
          return car.brand.toLowerCase().includes(searchTerm);
        default:
          return false;
      }
    });
    displayFilteredCars(filteredCars);
  }
});

//caso não haja nada no pesquisar
$(document).on("input", "#searchInput", function () {
  if ($(this).val().trim() === "") {
    displayCars(); // Voltar pra tabela inicial quando nada tiver escrito
  }
});

// Inicializa os dados ao carregar a página
$(document).ready(function () {
  $("#deleteModal").hide(); // Garante que a modal está escondida
  loadData();
});
