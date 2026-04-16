// ############################################
// ############## LISTENNERS ##################
// ############################################
let novaCuidadoraModal;
let deletarCuidadoraModal;
let detalhesCuidadoraModal;
let plantoesCuidadoraModal;

document.addEventListener("DOMContentLoaded", () => {
    loadCuidadoras();
    novaCuidadoraModal = new bootstrap.Modal(document.getElementById('novaCuidadoraModal'));
    deletarCuidadoraModal = new bootstrap.Modal(document.getElementById('deletarCuidadoraModal'));
    detalhesCuidadoraModal = new bootstrap.Modal(document.getElementById('detalhesCuidadoraModal'));
    plantoesCuidadoraModal = new bootstrap.Modal(document.getElementById('plantoesCuidadoraModal'));
});

document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault()
    loadCuidadoras()
})

document.getElementById("novaCuidadoraBtn").addEventListener("click", () => {
    abrirModalNovaCuidadora();
});

document.getElementById("saveNovaCuidadoraBtn").addEventListener("click", saveCuidadora);
document.getElementById("deletarCuidadoraBtn").addEventListener("click", deleteCuidadora);
document.getElementById("filter_btn").addEventListener("click", loadCuidadoras);
document.getElementById("clear_filter_btn").addEventListener("click", clearFilter);

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
                    document.getElementById("bairro").value = data.bairro;
                    document.getElementById("cidade").value = data.localidade;
                    document.getElementById("estado").value = data.uf;
                }
            })
            .catch(error => console.error("Erro ao buscar CEP:", error));
    }
});

// ############################################
// ############################################


// ############################################
// ############## HELPERS #####################
// ############################################

function formatDate(date) {
    return new Date(date).toLocaleDateString("pt-BR")
}

function formatDateTime(date) {
    return new Date(date).toLocaleDateString("pt-BR") + " " + new Date(date).toLocaleTimeString("pt-BR")
}

function clearFilter() {
    document.getElementById("filter_type").value = ""
    document.getElementById("filter_value").value = ""
    loadCuidadoras()
}

function loadCuidadoras() {
    const filterField = document.getElementById("filter_type").value
    const filterValue = document.getElementById("filter_value").value.trim()

    const params = new URLSearchParams()

    if (filterField && filterValue) {
        params.append("search", `${filterField}:${filterValue}`)
    }

    const url = params.toString()
        ? `/api/cuidadoras/?${params.toString()}`
        : `/api/cuidadoras/`

    getData(url, (data) => {
        renderCuidadoras(data.results)

        renderPaginationDRF({
            next: data.next,
            previous: data.previous
        })
    })
}

async function saveCuidadora() {
    let id_cuidadora = document.getElementById("id_cuidadora").value
    let nome = document.getElementById("nome").value
    let cpf = document.getElementById("cpf").value
    let nascimento = document.getElementById("nascimento").value
    let cnpj = document.getElementById("cnpj").value
    let telefone = document.getElementById("telefone").value
    let cep = document.getElementById("cep").value
    let endereco = document.getElementById("endereco").value
    let numero = document.getElementById("numero").value
    let complemento = document.getElementById("complemento").value
    let bairro = document.getElementById("bairro").value
    let cidade = document.getElementById("cidade").value
    let estado = document.getElementById("estado").value
    let ativoBool = document.getElementById("ativo").checked;

    let url
    let method

    if (id_cuidadora) {
        url = `/api/cuidadoras/${id_cuidadora}/`
        method = "PATCH"
    } else {
        url = `/api/cuidadoras/`
        method = "POST"
    }

    let payload = {
        "id_cuidadora": id_cuidadora,
        "nome": nome,
        "cpf": cpf,
        "nascimento": nascimento,
        "cnpj": cnpj,
        "telefone": telefone,
        "cep": cep,
        "endereco": endereco,
        "numero": numero,
        "complemento": complemento,
        "bairro": bairro,
        "cidade": cidade,
        "estado": estado,
        "ativo": ativoBool
    }

    let res = await saveData(
        url, payload,
        () => {
            novaCuidadoraModal.hide();
            loadCuidadoras();
        },
        method
    )

    if (res) {
        novaCuidadoraModal.hide();
        showToast("Cuidadora salva com sucesso!", "success");
    }
}

async function deleteCuidadora() {
    let id_cuidadora = document.getElementById("deletarCuidadoraId").value;

    let res = await deleteData(
        `/api/cuidadoras/${id_cuidadora}/`,
        () => {
            deletarCuidadoraModal.hide();
            loadCuidadoras();
        }
    )

    if (res) {
        deletarCuidadoraModal.hide();
        showToast("Cuidadora deletada com sucesso!", "success");
    }
}

async function getPlantoes(cuidadora_id) {
    getData(`/api/plantao/?cuidadora=${cuidadora_id}`, (data) => {
        renderPlantoes(data)
        plantoesCuidadoraModal.show();
    })
}

async function toggleActiveCuidadora(id_cuidadora) {
    let res = await patchData(
        `/api/cuidadoras/${id_cuidadora}/active/`,
        null,
        () => {
            loadCuidadoras();
        }
    )

    if (res) {
        showToast("Cuidadora atualizada com sucesso!", "success");
    }
}

// ############################################
// ############################################


// ############################################
// ############## RENDERS #####################
// ############################################

function renderPaginationDRF(pagination) {
    let container = document.getElementById("pagination")

    let html = `<div class="d-flex justify-content-center gap-2 mt-4">`

    html += `
        <button class="btn-modern"
            ${!pagination.previous ? "disabled" : ""}
            onclick="loadPacientes('${pagination.previous}')">
            ← Anterior
        </button>
    `

    html += `
        <button class="btn-modern"
            ${!pagination.next ? "disabled" : ""}
            onclick="loadPacientes('${pagination.next}')">
            Próxima →
        </button>
    `

    html += `</div>`

    container.innerHTML = html
}

function renderCuidadoras(cuidadoras) {
    let container = document.getElementById("table-cuidadoras")

    if (cuidadoras.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                Nenhuma cuidadora encontrada.
            </div>
        `
        return;
    }

    let html = ""

    cuidadoras.forEach(cuidadora => {
        const enderecoCompleto = `${cuidadora.endereco}, ${cuidadora.numero}, ${cuidadora.complemento}, ${cuidadora.bairro}, ${cuidadora.cidade}-${cuidadora.estado}, ${cuidadora.cep}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
        const telefoneLimpo = cuidadora.telefone.replace(/\D/g, "");

        const ativa = cuidadora.ativo
        let icon
        let title

        if (ativa) {
            icon = "bi-check-circle text-success"
            title = "Ativa"
        } else {
            icon = "bi-x-circle text-danger"
            title = "Inativa"
        }

        html += `
        <div class="col-12 col-md-3 col-lg-3 col-xl-3">
            <div class="card shadow-lg border-0">

                <div class="card-header">
                    <div class="d-flex justify-content-end">
                        <div>
                            <button class="btn-modern btn-sm" title="${title}" onclick="toggleActiveCuidadora(${cuidadora.id})">
                                <i class="bi ${icon}"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Editar"
                                data-cuidadora='${JSON.stringify(cuidadora)}'
                                onclick="abrirModalEditarCuidadora(this)"
                            >
                                <i class="bi bi-pencil-square"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Escalas e Plantões"
                                onclick="getPlantoes(${cuidadora.id})">
                                <i class="bi bi-calendar"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Detalhes"
                                data-cuidadora='${JSON.stringify(cuidadora)}'
                                onclick="abrirModalDetalheCuidadora(this)">
                                <i class="bi bi-eye"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Excluir"
                                onclick="abrirModalDeleteCuidadora(${cuidadora.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-body d-flex flex-column">
                    <div class="fw-semibold fs-5">${cuidadora.nome}</div>
                    <div class="mb-3 small text-muted">
                        ${cuidadora.cpf}
                    </div>
                    <div class="mb-3 small">
                        ${cuidadora.telefone}
                        <a href="https://wa.me/55${telefoneLimpo}" target="_blank" class="text-success text-decoration-none">
                            <i class="bi bi-whatsapp btn-modern"></i>
                        </a>
                    </div>

                </div>
                <div class="card-footer small">
                    <small class="text-body fw-bold ms-2">
                        <a href="${mapsUrl}" target="_blank" class="text-decoration-none">
                            <i class="bi bi-geo-alt-fill text-primary border rounded"></i>
                        </a>
                        ${cuidadora.endereco}, ${cuidadora.numero}, ${cuidadora.bairro}
                        ${cuidadora.cep} - ${cuidadora.cidade}-${cuidadora.estado} ${cuidadora.complemento ? ', ' + cuidadora.complemento : ''}</p>
                    </small>
                </div>

            </div>
        </div>
        `
    })

    container.innerHTML = html
}

function renderPlantoes(plantoes) {
    let container = document.getElementById("plantoes")
    const statusMap = {
        "P": {
            label: "Pendente de Cuidador",
            class: "bg-warning-subtle text-warning-emphasis",
            icon: "bi-hourglass-split"
        },
        "A": {
            label: "Cuidador Aprovado",
            class: "bg-primary-subtle text-primary-emphasis",
            icon: "bi-person-check"
        },
        "C": {
            label: "Confirmado",
            class: "bg-success-subtle text-success-emphasis",
            icon: "bi-check-circle"
        },
        "F": {
            label: "Finalizado",
            class: "bg-secondary-subtle text-secondary-emphasis",
            icon: "bi-flag"
        }
    }

    if (plantoes.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5 text-body-secondary">
                    <i class="bi bi-calendar-x fs-1 d-block mb-2"></i>
                    Nenhum plantão encontrado
                </div>
            </div>
        `
        return;
    }

    let html = ""

    plantoes.forEach(plantao => {

        const statusMap = {
            "P": { label: "Pendente", class: "bg-warning-subtle text-warning-emphasis" },
            "C": { label: "Confirmado", class: "bg-success-subtle text-success-emphasis" },
            "F": { label: "Finalizado", class: "bg-secondary-subtle text-secondary-emphasis" }
        }

        const status = statusMap[plantao.status] || { label: "Desconhecido", class: "bg-secondary-subtle" }

        html += `
        <div class="col-12 col-md-6 col-lg-4 col-xl-4 mb-4">
            <div class="card h-100 plantao-card">

                <div class="card-body d-flex flex-column">

                    <!-- Topo -->
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge plantao-badge">
                            ${plantao.escala_codigo_interno || 'Sem código'}
                        </span>
                        <span class="badge d-flex align-items-center gap-1 ${status.class}">
                            <i class="bi ${status.icon}"></i>
                            ${status.label}
                        </span>
                    </div>

                    <!-- Data -->
                    <div class="mb-3 small text-body-secondary">
                        <i class="bi bi-calendar-event me-1"></i>
                        ${formatDateTime(plantao.inicio)}<br>
                        <span class="opacity-75">até</span><br>
                        <i class="bi bi-calendar-event me-1"></i>
                        ${formatDateTime(plantao.fim)}
                    </div>

                    <!-- Horas -->
                    <div class="mb-3">
                        <span class="badge bg-info-subtle text-info-emphasis">
                            ⏱ ${plantao.horas}h
                        </span>
                    </div>

                    <!-- Paciente -->
                    <div class="d-flex align-items-center mb-2">
                        <div class="avatar-icon me-2">
                            <i class="bi bi-person-heart"></i>
                        </div>
                        <div class="text-truncate">
                            <div class="fw-semibold">${plantao.paciente_nome}</div>
                            <small class="text-body-secondary">Paciente</small>
                        </div>
                    </div>

                    <!-- Cuidadora -->
                    <div class="d-flex align-items-center">
                        <div class="avatar-icon me-2">
                            <i class="bi bi-person-badge"></i>
                        </div>
                        <div class="text-truncate">
                            <div class="fw-semibold">${plantao.cuidadora_nome}</div>
                            <small class="text-body-secondary">Cuidadora</small>
                        </div>
                    </div>

                    <div class="mt-auto"></div>

                </div>
            </div>
        </div>
        `
    })

    container.innerHTML = html
}
// ############################################
// ############################################


// ############################################
// ############## MODALS ######################
// ############################################

function abrirModalNovaCuidadora() {
    document.getElementById("id_cuidadora").value = ""
    document.getElementById("nome").value = ""
    document.getElementById("cpf").value = ""
    document.getElementById("nascimento").value = ""
    document.getElementById("cnpj").value = ""
    document.getElementById("telefone").value = ""
    document.getElementById("cep").value = ""
    document.getElementById("endereco").value = ""
    document.getElementById("numero").value = ""
    document.getElementById("complemento").value = ""
    document.getElementById("bairro").value = ""
    document.getElementById("cidade").value = ""
    document.getElementById("estado").value = ""
    document.getElementById("ativo").value = ""

    novaCuidadoraModal.show();
}

function abrirModalEditarCuidadora(btn) {
    let cuidadora = JSON.parse(btn.dataset.cuidadora)
    document.getElementById("id_cuidadora").value = cuidadora.id
    document.getElementById("nome").value = cuidadora.nome
    document.getElementById("cpf").value = cuidadora.cpf
    document.getElementById("nascimento").value = cuidadora.nascimento
    document.getElementById("cnpj").value = cuidadora.cnpj
    document.getElementById("telefone").value = cuidadora.telefone
    document.getElementById("cep").value = cuidadora.cep
    document.getElementById("endereco").value = cuidadora.endereco
    document.getElementById("numero").value = cuidadora.numero
    document.getElementById("complemento").value = cuidadora.complemento
    document.getElementById("bairro").value = cuidadora.bairro
    document.getElementById("cidade").value = cuidadora.cidade
    document.getElementById("estado").value = cuidadora.estado
    document.getElementById("ativo").value = cuidadora.ativo

    novaCuidadoraModal.show();
}

function abrirModalDeleteCuidadora(id) {
    document.getElementById("deletarCuidadoraId").value = id;
    deletarCuidadoraModal.show();
}

function abrirModalDetalheCuidadora(btn) {
    let cuidadora = JSON.parse(btn.dataset.cuidadora)
    document.getElementById("detalhe_nome").value = cuidadora.nome
    document.getElementById("detalhe_cpf").value = cuidadora.cpf
    document.getElementById("detalhe_nascimento").value = cuidadora.nascimento
    document.getElementById("detalhe_cnpj").value = cuidadora.cnpj
    document.getElementById("detalhe_telefone").value = cuidadora.telefone
    document.getElementById("detalhe_cep").value = cuidadora.cep
    document.getElementById("detalhe_endereco").value = cuidadora.endereco
    document.getElementById("detalhe_numero").value = cuidadora.numero
    document.getElementById("detalhe_complemento").value = cuidadora.complemento
    document.getElementById("detalhe_bairro").value = cuidadora.bairro
    document.getElementById("detalhe_cidade").value = cuidadora.cidade
    document.getElementById("detalhe_estado").value = cuidadora.estado

    document.getElementById("detalhe_ativo").checked = cuidadora.ativo;

    detalhesCuidadoraModal.show();
}
// ############################################
// ############################################

