let pagamentoModal;
let searchPlantaoModal;
let plantaoDetailsModal;

document.addEventListener("DOMContentLoaded", () => {
    loadPagamento();
    getRegraPagamentos();
    pagamentoModal = new bootstrap.Modal(document.getElementById('pagamentoModal'));
    searchPlantaoModal = new bootstrap.Modal(document.getElementById('searchPlantaoModal'));
    plantaoDetailsModal = new bootstrap.Modal(document.getElementById('plantaoDetailsModal'));
})

document.getElementById("novoPagamentoBtn").addEventListener("click", () => {
    abrirNovoPagamentoModal()
})

document.getElementById("abrirSearchPlantao").addEventListener("click", () => {
    openSearchPlantaoModal()
})

document.getElementById("filter_btn_plantao").addEventListener("click", () => {
    getPlantoes()
})

document.getElementById("clear_filter_btn_plantao").addEventListener("click", () => {
    clearFilterPlantao()
})

document.getElementById("filter_btn").addEventListener("click", () => {
    loadPagamento()
})

document.getElementById("clear_filter_btn").addEventListener("click", () => {
    clearFilterPagamento()
})


document.getElementById("savePagamentoBtn").addEventListener("click", () => {
    savePagamento()
})


function clearFilterPagamento() {
    document.getElementById("filter_type").value = "codigo_interno"
    document.getElementById("filter_value").value = ""
    document.getElementById("data_inicio").value = ""
    document.getElementById("data_fim").value = ""

    loadPagamento()
}

function renderPaginationDRF(pagination, callback) {
    let container = document.getElementById("pagination")

    let html = `<div class="d-flex justify-content-center gap-2 mt-4">`

    html += `
        <button class="btn-modern"
            ${!pagination.previous ? "disabled" : ""}
            onclick="loadPagamento('${pagination.previous}')">
            ← Anterior
        </button>
    `

    html += `
        <button class="btn-modern"
            ${!pagination.next ? "disabled" : ""}
            onclick="loadPagamento('${pagination.next}')">
            Próxima →
        </button>
    `

    html += `</div>`

    container.innerHTML = html
}

// ###############################
// ######### PAGAMENTOS ##########
// ###############################


async function loadPagamento(url = null) {
    let filterField = document.getElementById("filter_type").value;
    let filterValue = document.getElementById("filter_value").value.trim();
    let dataInicio = document.getElementById("data_inicio").value;
    let dataFim = document.getElementById("data_fim").value;

    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField);
        params.append("filter_value", filterValue);
    }

    if (dataInicio) {
        params.append("data_inicio", dataInicio);
    }

    if (dataFim) {
        params.append("data_fim", dataFim);
    }

    const endpoint = url || `/api/pagamento/?${params.toString()}`

    getData(endpoint, (data) => {
        renderPagamentos(data.results)

        renderPaginationDRF({
            next: data.next,
            previous: data.previous
        })
    })
}


function renderPagamentos(pagamentos) {
    const container = document.getElementById('table-pagamentos')

    container.innerHTML = ""

    pagamentos.forEach(pagamento => {
        const linha = document.createElement('div')
        linha.className = "card p-2 mb-4 ms-2 me-2 shadow-sm"
        linha.innerHTML = `
            <div class="row g-2 align-items-center">

                <div class="col-4 col-md">
                    <label class="fw-bold">Código Interno</label>
                    <span class="small text-muted d-block">${pagamento.codigo_interno}</span>
                </div>

                <div class="col-4 col-md">
                    <label class="fw-bold">Plantão</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.codigo_interno}</span>
                </div>

                <div class="col-4 col-md">
                    <label class="fw-bold">Regra</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.regra_pagamento_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="fw-bold">Profissional</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.profissional_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="fw-bold">Assistido(a)</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.assistido_detalhe.nome}</span>
                </div>
                <div class="col-4 col-md">
                    <label class="fw-bold">Status</label>
                    <span class="small text-muted d-block">${pagamento.status_name}</span>
                </div>

                <div class="col-4 col-md">
                    <label class="fw-bold">Valor</label>
                    <span class="small text-muted d-block">
                        ${Number(pagamento.valor_calculado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>

                <div class="col-2 col-md-auto text-md-end mt-2 mt-md-0">
                    <a href="#" class="text-decoration-none btn-modern btn-sm me-1" data-plantao='${JSON.stringify(pagamento.plantao_detalhe)}' onclick="abrirDetalhesPlantaoModal(this)">
                        <i class="bi bi-eye"></i>
                    </a>
                    <a href="#" class="text-decoration-none btn-modern btn-sm me-1" data-pagamento='${JSON.stringify(pagamento)}' onclick="abrirEditarPagamentoModal(this)">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <a href="#" class="text-decoration-none btn-modern btn-sm" onclick="deletarPagamentoBtn(${pagamento.id})">
                        <i class="bi bi-trash"></i>
                    </a>
                </div>

            </div>
        `
        container.appendChild(linha)
    });
}


function savePagamento() {
    let pagamentoId = document.getElementById("pagamento_id_modal_pagamentos").value
    let plantaoId = document.getElementById("plantao_id_modal_pagamentos").value
    let valor_calculado = document.getElementById("valor_calculado_modal_pagamentos").value
    let status = document.getElementById("status_modal_pagamentos").value
    let regraPagamentoId = document.getElementById("regra_pagamento_id_modal_pagamentos").value

    const url = pagamentoId ? `/api/pagamento/${pagamentoId}/` : `/api/pagamento/`

    if (!plantaoId) {
        showToast("Selecione um plantão!", "danger")
        return
    }

    if (!valor_calculado) {
        showToast("Informe o valor calculado!", "danger")
        return
    }

    const data = {
        plantao: plantaoId,
        valor_calculado: valor_calculado,
        status: status,
        regra_pagamento: regraPagamentoId,
    }

    if (pagamentoId) {
        console.log("PATCH chamado")
        patchData(url, data, () => {
            pagamentoModal.hide()
            loadPagamento()
        })
    } else {
        console.log("POST chamado")
        saveData(url, data, () => {
            pagamentoModal.hide()
            loadPagamento()
        })
    }
}


async function abrirNovoPagamentoModal() {
    document.getElementById("pagamento_id_modal_pagamentos").value = ""
    document.getElementById("plantao_codigo_modal_pagamentos").value = ""
    document.getElementById("plantao_id_modal_pagamentos").value = ""
    document.getElementById("profissional_id_modal_pagamentos").value = ""
    document.getElementById("profissional_nome_modal_pagamentos").value = ""
    document.getElementById("assistido_id_modal_pagamentos").value = ""
    document.getElementById("assistido_nome_modal_pagamentos").value = ""
    document.getElementById("regra_pagamento_id_modal_pagamentos").value = ""

    document.getElementById("pagamentoModalLabel").innerText = "Novo Pagamento"
    pagamentoModal.show()
}


async function abrirEditarPagamentoModal(element) {
    const pagamento = JSON.parse(element.dataset.pagamento);

    document.getElementById("pagamento_id_modal_pagamentos").value = pagamento.id
    document.getElementById("plantao_codigo_modal_pagamentos").value = pagamento.codigo_interno
    document.getElementById("plantao_id_modal_pagamentos").value = pagamento.plantao
    document.getElementById("profissional_id_modal_pagamentos").value = pagamento.plantao_detalhe.profissional
    document.getElementById("profissional_nome_modal_pagamentos").value = pagamento.plantao_detalhe.profissional_detalhe.nome
    document.getElementById("assistido_id_modal_pagamentos").value = pagamento.plantao_detalhe.assistido
    document.getElementById("assistido_nome_modal_pagamentos").value = pagamento.plantao_detalhe.assistido_detalhe.nome
    document.getElementById("valor_calculado_modal_pagamentos").value = pagamento.valor_calculado
    document.getElementById("status_modal_pagamentos").value = pagamento.status
    document.getElementById("regra_pagamento_id_modal_pagamentos").value = pagamento.plantao_detalhe.regra_pagamento
    document.getElementById("pagamentoModalLabel").innerText = `Editar Pagamento - ${pagamento.codigo_interno}`
    pagamentoModal.show()
}


async function deletarPagamentoBtn(id) {
    if (!confirm("Deseja realmente excluir este pagamento?")) {
        return
    }

    deleteData(`/api/pagamento/${id}/`, () => {
        loadPagamento()
    })
}


// ###############################
// ######### PLANTÕES ############ 
// ###############################

function openSearchPlantaoModal() {
    searchPlantaoModal.show()
}

function getPlantoes() {
    const dataInicio = document.getElementById("data_inicio_plantao").value;
    const dataFim = document.getElementById("data_fim_plantao").value;
    const filterTypePlantao = document.getElementById("filter_type_plantao").value;
    const filterValuePlantao = document.getElementById("filter_value_plantao").value.trim();

    const params = new URLSearchParams();

    if (dataInicio) params.append("data_inicio", dataInicio);
    if (dataFim) params.append("data_fim", dataFim);
    if (filterTypePlantao) params.append("filter_type", filterTypePlantao);
    if (filterValuePlantao) params.append("filter_value", filterValuePlantao);
    params.append("status", "F")

    getData(`/api/plantao/?${params.toString()}`, (data) => {
        renderPlantoesSearch(data);
    })
}

function clearFilterPlantao() {
    document.getElementById("data_inicio_plantao").value = "";
    document.getElementById("data_fim_plantao").value = "";
    document.getElementById("filter_type_plantao").value = "";
    document.getElementById("filter_value_plantao").value = "";
    const container = document.getElementById('result_plantao')
    container.innerHTML = ""
}

function renderPlantoesSearch(plantoes) {
    const container = document.getElementById('result_plantao')
    container.innerHTML = ""

    if (plantoes.length == 0) {
        container.innerHTML = `<div class="alert alert-info">Nenhum plantão finalizado foi encontrado.</div>`
        return
    }

    plantoes.forEach(plantao => {
        const linha = document.createElement('div')
        linha.className = "card p-2 mb-4 ms-2 me-2 shadow-sm"
        linha.innerHTML = `
            <div class="row g-2 align-items-center">

                <div class="col-4 col-md">
                    <label class="small fw-bold">Código Interno</label>
                    <span class="small d-block">${plantao.codigo_interno}</span>
                </div>

                <div class="col-4 col-md">
                    <label class="small fw-bold">Regra</label>
                    <span class="small d-block">${plantao.regra_pagamento_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="small fw-bold">Profissional</label>
                    <span class="small d-block">${plantao.profissional_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="small fw-bold">Assistido(a)</label>
                    <span class="small d-block">${plantao.assistido_detalhe.nome}</span>
                </div>
                <div class="col-4 col-md">
                    <label class="small fw-bold">Status</label>
                    <span class="small d-block">${plantao.status_name}</span>
                </div>

                <div class="col-2 col-md-auto text-md-end mt-2 mt-md-0">
                    <a href="#" 
                        class="text-decoration-none btn-modern btn-sm me-1" 
                        id="selecionarPlantaoBtn" 
                        data-profissional_id="${plantao.profissional}"
                        data-profissional_nome="${plantao.profissional_detalhe.nome}"
                        data-assistido_id="${plantao.assistido}"
                        data-assistido_nome="${plantao.assistido_detalhe.nome}"
                        data-regra_pagamento_id="${plantao.regra_pagamento}"
                        data-status="${plantao.status}"
                        data-codigo_interno="${plantao.codigo_interno}"
                        data-id="${plantao.id}">
                        <i class="bi bi-plus"></i> Selecionar
                    </a>
                </div>

            </div>
        `
        container.appendChild(linha)
    });
}

document.addEventListener("click", function (e) {
    if (e.target.id === "selecionarPlantaoBtn") {
        e.preventDefault();
        const button = e.target;
        const profissionalId = button.getAttribute("data-profissional_id");
        const profissionalNome = button.getAttribute("data-profissional_nome");
        const assistidoId = button.getAttribute("data-assistido_id");
        const assistidoNome = button.getAttribute("data-assistido_nome");
        const regraPagamentoId = button.getAttribute("data-regra_pagamento_id");
        const codigoInterno = button.getAttribute("data-codigo_interno");
        const plantaoId = button.getAttribute("data-id");

        document.getElementById("profissional_id_modal_pagamentos").value = profissionalId;
        document.getElementById("profissional_nome_modal_pagamentos").value = profissionalNome;
        document.getElementById("assistido_id_modal_pagamentos").value = assistidoId;
        document.getElementById("assistido_nome_modal_pagamentos").value = assistidoNome;
        document.getElementById("regra_pagamento_id_modal_pagamentos").value = regraPagamentoId;
        document.getElementById("plantao_codigo_modal_pagamentos").value = codigoInterno;
        document.getElementById("plantao_id_modal_pagamentos").value = plantaoId;

        searchPlantaoModal.hide();
    }
});

function abrirDetalhesPlantaoModal(plantao) {
    const plantaoData = JSON.parse(plantao.getAttribute("data-plantao"))
    const container = document.getElementById('plantao-detail-modal')
    container.innerHTML = ""
    container.innerHTML = renderPlantaoModal(plantaoData);
    plantaoDetailsModal.show()
}

function renderPlantaoModal(plantao) {
    function formatDateTime(date) {
        return new Date(date).toLocaleTimeString("pt-BR").slice(0, 5) + " - " + new Date(date).toLocaleDateString("pt-BR")
    }

    function floatToHHMM(value) {
        const hours = Math.floor(value)
        const minutes = Math.round((value - hours) * 60)

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
    let bgcolor = ""
    let badgeColor = ""

    if (plantao.status == 'P') bgcolor = "bg-warning-subtle"
    else if (plantao.status == 'A' || plantao.status == 'C') bgcolor = "bg-secondary-subtle"
    else if (plantao.status == 'R') bgcolor = "bg-primary-subtle"
    else if (plantao.status == 'F') bgcolor = "bg-success-subtle"
    else if (plantao.status == 'E' || plantao.status == 'D') bgcolor = "bg-danger-subtle"

    if (plantao.status == 'P') badgeColor = "bg-warning"
    else if (plantao.status == 'A' || plantao.status == 'C') badgeColor = "bg-secondary"
    else if (plantao.status == 'R') badgeColor = "bg-primary"
    else if (plantao.status == 'F') badgeColor = "bg-success"
    else if (plantao.status == 'E' || plantao.status == 'D') badgeColor = "bg-danger"

    const cumpridas = floatToHHMM(plantao.horas_cumpridas)

    let horarioColor = plantao.horas_cumpridas < plantao.horas
        ? "bg-warning-subtle"
        : "bg-success-subtle"

    let textColor = plantao.horas_cumpridas < plantao.horas
        ? "text-danger"
        : "text-info-emphasis"

    const card = `
        <div class="col-12 mb-4">
            <div class="card plantao-card shadow-lg">
                <div class="card-header d-flex justify-content-between">
                    <div>
                        <small class="badge bg-primary-subtle text-primary-emphasis small fw-bold">${plantao.codigo_interno}</small>
                    </div>
                    <div>
                        <span class="badge text-center gap-1 ${badgeColor}">
                            ${plantao.status_name}
                        </span>
                    </div>

                </div>

                <div class="card-body d-flex flex-column">
                    <div class="mb-3 small text-center">
                        Carga Horária
                        <span class="badge bg-info-subtle text-info-emphasis">
                            ⏱ ${plantao.horas}h
                        </span>
                        <br>
                        Cumpridas
                        <span class="badge ${horarioColor} ${textColor}">
                            ⏱ ${cumpridas}h
                        </span>
                        <br>
                        Regra:
                        <span class="badge bg-info-subtle text-info-emphasis">
                            ${plantao.regra_pagamento_detalhe.nome || "Sem Regra"}
                        </span>
                    </div>

                    <div class="text-truncate text-center">
                        <div class="fw-semibold">
                            <small class="text-body-secondary">Assistido(a):</small>
                            ${plantao.assistido_detalhe.nome}
                        </div>
                    </div>

                    <div class="text-truncate text-center">
                        <div class="fw-semibold">
                            <small class="text-body-secondary">Profissional:</small>
                            ${plantao.profissional_detalhe.nome}
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-center mb-2">
                        <a href="/registro/${plantao.id}" target="_blank" class="btn-modern">
                            Registro
                        </a>
                    </div>
                </div>

                <div class="card-footer">
                    <div class="d-flex justify-content-center gap-1">
                        <small>
                            <span class="badge bg-dark rounded-pill">
                                ${formatDateTime(plantao.inicio)}
                            </span>
                            <span class="badge bg-dark rounded-pill">
                                <i class="bi bi-arrow-right-short"></i>
                            </span>
                            <span class="badge bg-dark rounded-pill">
                                ${formatDateTime(plantao.fim)}
                            </span>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `
    return card;
}

// ###############################
// ######### PAGAMENTOS ##########
// ###############################


async function getRegraPagamentos() {
    getData(`/api/regra-pagamento/`, (data) => {
        renderRegraPagamentosSelect(data.results);
    })
}

function renderRegraPagamentosSelect(regras) {
    const select = document.getElementById('regra_pagamento_id_modal_pagamentos');
    select.innerHTML = ""
    regras.forEach(regra => {
        const option = document.createElement("option");
        option.value = regra.id;
        option.textContent = regra.nome;
        select.appendChild(option);
    });
}
