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
    let filterField = document.getElementById("filter_type").value;
    let filterValue = document.getElementById("filter_value").value.trim();
    let checked = document.getElementById("filter_active").checked;
    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField);
        params.append("filter_value", filterValue);
    } else if (checked) {
        params.append("is_active", true);
    }

    getData(`/api/cuidadoras/?${params.toString()}`, (data) => {
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
        "is_active": ativoBool
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

        const ativa = cuidadora.is_active
        let icon
        let title

        if (ativa) {
            icon = "bi-check-circle text-success"
            title = "Ativa"
        } else {
            icon = "bi-x-circle text-danger"
            title = "Inativa"
        }

        let badgeAtiva = ""

        if (ativa) {
            badgeAtiva = ""
        } else {
            badgeAtiva = "<span class='badge bg-danger'>Cuidador(a) Inativo(a)</span>"
        }

        html += `
        <div class="col-12 col-md-3 col-lg-3 col-xl-3">
            <div class="card shadow-lg border-0">

                <div class="card-header">
                    <div class="d-flex justify-content-between">
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
                        </div>
                    </div>
                </div>

                <div class="card-body d-flex flex-column">
                    ${badgeAtiva}
                    <div class="fw-semibold fs-5">${cuidadora.nome}</div>
                    <div class="mb-3 small text-muted">
                        ${cuidadora.cpf}
                    </div>
                    <div class="mb-3 small">
                        ${cuidadora.telefone}
                        <a href="https://wa.me/55${telefoneLimpo}" target="_blank" class="text-success text-decoration-none">
                            <i class="bi bi-whatsapp btn-modern btn-sm"></i>
                        </a>
                    </div>

                </div>
                <div class="card-footer small">
                    <small class="text-body fw-bold ms-2">
                        <a href="${mapsUrl}" target="_blank" class="text-decoration-none">
                            <i class="bi bi-geo-alt-fill text-primary border rounded btn-modern btn-sm"></i>
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
    let divAndamento = document.getElementById("plantoes-andamento")
    let divFinalizados = document.getElementById("plantoes-finalizados")
    let divExpirados = document.getElementById("plantoes-expirados")

    function floatToHHMM(value) {
        const hours = Math.floor(value)
        const minutes = Math.round((value - hours) * 60)

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }

    let htmlAndamento = ""
    let htmlFinalizados = ""
    let htmlExpirados = ""

    plantoes.forEach(plantao => {
        let bgcolor = ""

        if (plantao.status == 'P') bgcolor = "bg-warning"
        else if (plantao.status == 'A' || plantao.status == 'C') bgcolor = "bg-secondary"
        else if (plantao.status == 'R') bgcolor = "bg-primary"
        else if (plantao.status == 'F') bgcolor = "bg-success"
        else if (plantao.status == 'E') bgcolor = "bg-danger"

        const cumpridas = floatToHHMM(plantao.horas_cumpridas)

        let horarioColor = plantao.horas_cumpridas < plantao.horas
            ? "bg-warning-subtle"
            : "bg-success-subtle"

        let textColor = plantao.horas_cumpridas < plantao.horas
            ? "text-danger"
            : "text-info-emphasis"

        const card = `
            <div class="col-12 col-md-6 col-lg-4 col-xl-4 mb-4">
                <div class="card h-100 plantao-card">
                    <div class="card-body d-flex flex-column">

                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge plantao-badge">
                                ${plantao.escala_codigo_interno || 'Sem código'}
                            </span>
                            <span class="badge d-flex align-items-center gap-1 ${bgcolor}">
                                ${plantao.status_name}
                            </span>
                        </div>

                        <div class="mb-3 small text-body-secondary">
                            <i class="bi bi-calendar-event me-1"></i>
                            ${formatDateTime(plantao.inicio)}<br>
                            <span class="opacity-75">até</span><br>
                            <i class="bi bi-calendar-event me-1"></i>
                            ${formatDateTime(plantao.fim)}
                        </div>

                        <div class="mb-3 small">
                            Carga Horária
                            <span class="badge bg-info-subtle text-info-emphasis">
                                ⏱ ${plantao.horas}h
                            </span>
                            Cumpridas
                            <span class="badge ${horarioColor} ${textColor}">
                                ⏱ ${cumpridas}h
                            </span>
                        </div>

                        <div class="d-flex align-items-center mb-2">
                            <div class="avatar-icon me-2">
                                <i class="bi bi-person-heart"></i>
                            </div>
                            <div class="text-truncate">
                                <div class="fw-semibold">${plantao.paciente_nome}</div>
                                <small class="text-body-secondary">Paciente</small>
                            </div>
                        </div>

                        <div class="d-flex align-items-center">
                            <div class="avatar-icon me-2">
                                <i class="bi bi-person-badge"></i>
                            </div>
                            <div class="text-truncate">
                                <div class="fw-semibold">${plantao.cuidadora_nome}</div>
                                <small class="text-body-secondary">Cuidador(a)</small>
                            </div>
                        </div>

                        <div class="mt-auto"></div>
                    </div>
                </div>
            </div>
        `

        if (['A', 'C', 'P', 'R'].includes(plantao.status)) {
            htmlAndamento += card
        } else if (plantao.status == 'F') {
            htmlFinalizados += card
        } else if (plantao.status == 'E') {
            htmlExpirados += card
        }
    })

    divAndamento.innerHTML = htmlAndamento
    divFinalizados.innerHTML = htmlFinalizados
    divExpirados.innerHTML = htmlExpirados
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
    document.getElementById("ativo").value = cuidadora.is_active

    novaCuidadoraModal.show();
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

    document.getElementById("detalhe_ativo").checked = cuidadora.is_active;

    detalhesCuidadoraModal.show();
}
// ############################################
// ############################################

