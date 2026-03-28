document.addEventListener("DOMContentLoaded", function () {
    getPacientes();
});

function getPacientes() {
    showLoader();
    fetch("/api/pacientes/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            renderPacientes(data);
            hideLoader();
        })
        .catch(error => {
            console.error("Erro ao buscar pacientes:", error);
            hideLoader();
        });
}

function renderPacientes(pacientes) {
    let tableBody = document.getElementById("table-pacientes")
    tableBody.innerHTML = ""

    pacientes.forEach(paciente => {
        if (paciente.sexo == "M") {
            badge = "badge bg-primary bg-opacity-10 text-primary border border-primary-subtle rounded-pill"
            icon = "bi bi-gender-male me-1"
            text = "Masculino"
        } else if (paciente.sexo == "F") {
            badge = "badge bg-danger bg-opacity-10 text-danger border border-danger-subtle rounded-pill"
            icon = "bi bi-gender-female me-1"
            text = "Feminino"
        } else {
            badge = "badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle rounded-pill"
            icon = "bi bi-gender-neutral me-1"
            text = paciente.sexo
        }

        const enderecoCompleto = `${paciente.endereco}, ${paciente.cidade}, ${paciente.estado}, ${paciente.cep}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;

        tableBody.innerHTML += `
        <tr>
            <td class="ps-4">
                <div class="fw-semibold text-body-emphasis">${paciente.nome}</div>
                <div class="text-body-secondary small">
                    ${paciente.idade} anos
                    <span
                        class="${badge}">
                        <i class="${icon}"></i>${text}
                    </span>
                </div>
            </td>

            <td class="text-center">
                <div>
                    <p>
                        <a href="${mapsUrl}" target="_blank" title="Ver no Google Maps" class="text-decoration-none">
                            <i class="bi bi-geo-alt-fill text-primary"></i>
                        </a>
                        ${paciente.endereco}
                    </p>
                    <small class="text-muted">
                        ${paciente.cep} -
                        ${paciente.cidade} - ${paciente.estado}
                    </small>
                </div>
            </td>

            <td class="text-center pe-4">
                <small class="text-truncate text-muted">${paciente.observacoes}</small>
            </td>

            <!-- Coluna Ações -->
            <td class="text-center pe-4">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-success" title="Editar Paciente">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Responsáveis">
                        <i class="bi bi-people"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary" title="Detalhes do Paciente">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger"
                        title="Excluir Paciente">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        
        `
    });
}