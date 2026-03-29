
// ############################################
// ############## LISTENNERS ##################
// ############################################
let novoPacienteModal;
let detalhesPacienteModal;
let deletarPacienteModal;
let responsavelModal;
let novoResponsavelModal;
let deletarResponsavelModal;

document.addEventListener("DOMContentLoaded", () => {
    loadPacientes()
    novoPacienteModal = new bootstrap.Modal(document.getElementById("novoPacienteModal"));
    detalhesPacienteModal = new bootstrap.Modal(document.getElementById("detalhesPacienteModal"));
    deletarPacienteModal = new bootstrap.Modal(document.getElementById("deletarPacienteModal"));
    responsavelModal = new bootstrap.Modal(document.getElementById("responsavelModal"));
    novoResponsavelModal = new bootstrap.Modal(document.getElementById("novoResponsavelModal"));
    deletarResponsavelModal = new bootstrap.Modal(document.getElementById("deletarResponsavelModal"));
});

document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault()
    loadPacientes()
})


document.getElementById("novoPacienteBtn").addEventListener("click", abrirModalNovoPaciente);
document.getElementById("saveNovoPacienteBtn").addEventListener("click", salvarPaciente);
document.getElementById("deletarPacienteBtn").addEventListener("click", deletarPaciente);
document.getElementById("adicionarResponsavelBtn").addEventListener("click", abrirModalNovoResponsavel);
document.getElementById("saveNovoResponsavelBtn").addEventListener("click", salvarResponsavel);
document.getElementById("deletarResponsavelBtn").addEventListener("click", deletarResponsavel);


document.getElementById("cep").addEventListener("blur", function () {
    const cep = this.value.replace("-", "");
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    showToast("CEP não encontrado!", "danger");
                    return;
                } else {
                    document.getElementById("endereco").value = data.logradouro;
                    document.getElementById("cidade").value = data.localidade;
                    document.getElementById("estado").value = data.uf;
                }
            })
            .catch(error => console.error("Erro ao buscar CEP:", error));
    }
});

// ############################################
// ############## RENDERS #####################
// ############################################

function loadPacientes(url = null) {
    const search = document.querySelector('input[name="search"]').value || ""

    if (!url) {
        url = `/api/pacientes/?search=${encodeURIComponent(search)}`
    }

    getData(url, (data) => {
        renderPacientes(data.results)

        renderPaginationDRF({
            next: data.next,
            previous: data.previous
        })
    })
}


function renderPaginationDRF(pagination) {
    let container = document.getElementById("pagination")

    let html = `<div class="d-flex justify-content-center gap-2 mt-4">`

    html += `
        <button class="btn btn-outline-secondary"
            ${!pagination.previous ? "disabled" : ""}
            onclick="loadPacientes('${pagination.previous}')">
            ← Anterior
        </button>
    `

    html += `
        <button class="btn btn-outline-secondary"
            ${!pagination.next ? "disabled" : ""}
            onclick="loadPacientes('${pagination.next}')">
            Próxima →
        </button>
    `

    html += `</div>`

    container.innerHTML = html
}

function renderPacientes(pacientes = []) {
    let container = document.getElementById("table-pacientes")
    container.innerHTML = ""

    if (pacientes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                Nenhum paciente encontrado.
            </div>
        `
        return;
    }

    let html = `<div class="row g-3">`

    pacientes.forEach(paciente => {
        let badge, icon, text;

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

        html += `
        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
            <div class="card shadow-lg border-0">

                <div class="card-header">
                    <div class="d-flex justify-content-between">
                        <div class="fw-semibold fs-5">${paciente.nome}</div>
                        ${paciente.idade} anos
                        <span class="${badge}">
                            <i class="${icon}"></i>${text}
                        </span>
                    </div>
                </div>

                <div class="card-body d-flex flex-column">
                    <!-- Endereço -->
                    <div class="small mb-2">
                        <a href="${mapsUrl}" target="_blank" class="text-decoration-none">
                            <i class="bi bi-geo-alt-fill text-primary btn-modern"></i>
                        </a>
                        <small class="text-body fw-bold ms-2">
                            ${paciente.endereco} - ${paciente.cidade}-${paciente.estado} - ${paciente.cep}
                        </small>
                    </div>

                    <!-- Observações -->
                    <div class="mt-auto mb-2 border-top pt-2">
                        <small class="text-muted">
                            ${paciente.observacoes || "Sem observações"}
                        </small>
                    </div>
                </div>
                <div class="card-footer d-flex justify-content-between mt-2">
                        <button class="btn-modern" title="Editar"
                            data-paciente='${JSON.stringify(paciente)}'
                            onclick="abrirModalEditarPaciente(this)">
                            <i class="bi bi-pencil-square"></i>
                        </button>

                        <button class="btn-modern" title="Responsáveis"
                            onclick="abrirModalResponsavel(${paciente.id})">
                            <i class="bi bi-people"></i>
                        </button>

                        <button class="btn-modern" title="Detalhes"
                            onclick="abrirModalDetalhesPaciente(${paciente.id})">
                            <i class="bi bi-eye"></i>
                        </button>

                        <button class="btn-modern" title="Excluir"
                            onclick="abrirModalExcluirPaciente(${paciente.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
            </div>
        </div>
        `
    });

    html += `</div>`
    container.innerHTML = html
}

function renderResponsaveis(responsaveis) {
    const responsaveisTableBody = document.getElementById("responsaveisTableBody");
    responsaveisTableBody.innerHTML = "";

    if (responsaveis.results.length === 0) {
        responsaveisTableBody.innerHTML = `
        <tr>
            <td colspan="3" class="text-center">Nenhum responsável encontrado.</td>
        </tr>
        `;
        return;
    }

    responsaveis.results.forEach(responsavel => {
        const telefoneLimpo = responsavel.telefone.replace(/\D/g, "");

        responsaveisTableBody.innerHTML += `
        <tr class="text-center">
            <td>${responsavel.nome}</td>
            <td>
                ${responsavel.telefone}
                <a href="https://wa.me/55${telefoneLimpo}" target="_blank" class="text-success text-decoration-none">
                    <i class="bi bi-whatsapp btn-modern"></i> 
                </a>
            </td>
            <td>
                <a href="#" title="Editar Responsável" 
                    class="text-decoration-none"
                    data-responsavel='${JSON.stringify(responsavel)}'
                    onclick="abrirModalEditarResponsavel(this)">
                    <i class="bi bi-pencil-square btn-modern"></i>
                </a>
                <a href="#" title="Excluir Responsável" 
                    class="text-decoration-none"
                    onclick="abrirModalExcluirResponsavel(${responsavel.id})">
                    <i class="bi bi-trash btn-modern"></i>
                </a>
            </td>
        </tr>
        `;
    });
}

// ############################################
// ############################################


// ############################################
// ############## MODAIS #####################
// ############################################

function abrirModalNovoPaciente() {
    document.getElementById("nome").value = "";
    document.getElementById("idade").value = "";
    document.getElementById("sexo").value = "";
    document.getElementById("cep").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("estado").value = "";
    document.getElementById("observacoes").value = "";
    novoPacienteModal.show();
}

async function abrirModalDetalhesPaciente(id) {
    let paciente = await getData(
        url = `/api/pacientes/${id}/`,
        renderFunction = null
    );
    let sexo;
    if (paciente.sexo == "M") {
        sexo = "Masculino";
    } else if (paciente.sexo == "F") {
        sexo = "Feminino";
    } else {
        sexo = paciente.sexo;
    }

    document.getElementById("detalhe_nome").value = paciente.nome;
    document.getElementById("detalhe_idade").value = paciente.idade;
    document.getElementById("detalhe_sexo").value = sexo;
    document.getElementById("detalhe_cep").value = paciente.cep;
    document.getElementById("detalhe_endereco").value = paciente.endereco;
    document.getElementById("detalhe_cidade").value = paciente.cidade;
    document.getElementById("detalhe_estado").value = paciente.estado;
    document.getElementById("detalhe_observacoes").value = paciente.observacoes;
    detalhesPacienteModal.show();
}

async function abrirModalEditarPaciente(btn) {
    let paciente = JSON.parse(btn.getAttribute("data-paciente"));
    document.getElementById("pacienteId").value = paciente.id;
    document.getElementById("nome").value = paciente.nome;
    document.getElementById("idade").value = paciente.idade;
    document.getElementById("sexo").value = paciente.sexo;
    document.getElementById("cep").value = paciente.cep;
    document.getElementById("endereco").value = paciente.endereco;
    document.getElementById("cidade").value = paciente.cidade;
    document.getElementById("estado").value = paciente.estado;
    document.getElementById("observacoes").value = paciente.observacoes;
    novoPacienteModal.show();
}

async function abrirModalExcluirPaciente(id) {
    document.getElementById("deletarPacienteId").value = id;
    deletarPacienteModal.show();
}

async function abrirModalResponsavel(id) {
    document.getElementById("pacienteIdModal").value = id;
    let responsaveis = await getData(
        url = `/api/responsaveis/?paciente=${id}`,
        renderFunction = renderResponsaveis
    );
    responsavelModal.show();
}

function abrirModalNovoResponsavel() {
    let pacienteId = document.getElementById("pacienteIdModal").value;
    document.getElementById("pacienteId").value = pacienteId;
    document.getElementById("responsavelId").value = "";
    document.getElementById("novo_responsavel_nome").value = "";
    document.getElementById("novo_responsavel_telefone").value = "";
    novoResponsavelModal.show();
}

function abrirModalEditarResponsavel(btn) {
    let responsavel = JSON.parse(btn.getAttribute("data-responsavel"));
    document.getElementById("responsavelId").value = responsavel.id;
    document.getElementById("pacienteId").value = responsavel.paciente;
    document.getElementById("novo_responsavel_nome").value = responsavel.nome;
    document.getElementById("novo_responsavel_telefone").value = responsavel.telefone;
    novoResponsavelModal.show();
}

function abrirModalExcluirResponsavel(id) {
    document.getElementById("deletarResponsavelId").value = id;
    deletarResponsavelModal.show();
}

// ############################################
// ############################################


// ############################################
// ############## HELPERS #####################
// ############################################

function salvarPaciente() {
    const nome = document.getElementById("nome").value;
    const idade = document.getElementById("idade").value;
    const sexo = document.getElementById("sexo").value;
    const cep = document.getElementById("cep").value;
    const endereco = document.getElementById("endereco").value;
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;
    const observacoes = document.getElementById("observacoes").value;
    let pacienteId = document.getElementById("pacienteId").value;

    let url = "/api/pacientes/";
    let method = "POST";

    if (pacienteId) {
        pacienteId = parseInt(pacienteId);
        url = `/api/pacientes/${pacienteId}/`;
        method = "PATCH";
    }

    const paciente = {
        nome: nome,
        idade: idade,
        sexo: sexo,
        cep: cep,
        endereco: endereco,
        cidade: cidade,
        estado: estado,
        observacoes: observacoes
    };

    saveData(
        url = url,
        data = paciente,
        callBack = loadPacientes,
        method = method
    );

    novoPacienteModal.hide();
}

function deletarPaciente() {
    const id = document.getElementById("deletarPacienteId").value;
    deleteData(`/api/pacientes/${id}/`, loadPacientes);
    deletarPacienteModal.hide();
}

function salvarResponsavel() {
    const nome = document.getElementById("novo_responsavel_nome").value;
    const telefone = document.getElementById("novo_responsavel_telefone").value;
    const pacienteId = document.getElementById("pacienteId").value;
    let responsavelId = document.getElementById("responsavelId").value;

    let url = "/api/responsaveis/";
    let method = "POST";

    if (responsavelId) {
        responsavelId = parseInt(responsavelId);
        url = `/api/responsaveis/${responsavelId}/`;
        method = "PATCH";
    }

    const responsavel = {
        nome: nome,
        telefone: telefone,
        paciente: pacienteId
    };

    saveData(
        url = url,
        data = responsavel,
        callBack = () => getData(url = "/api/responsaveis/", renderFunction = renderResponsaveis),
        method = method
    );

    novoResponsavelModal.hide();
}

function deletarResponsavel() {
    const id = document.getElementById("deletarResponsavelId").value;
    deleteData(
        url = `/api/responsaveis/${id}/`,
        callBack = () => getData(url = "/api/responsaveis/", renderFunction = renderResponsaveis)
    );
    deletarResponsavelModal.hide();
}