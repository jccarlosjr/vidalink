let pagamentoModal;
let searchPlantaoModal;

document.addEventListener("DOMContentLoaded", () => {
    loadPagamento()
    pagamentoModal = new bootstrap.Modal(document.getElementById('pagamentoModal'))
    searchPlantaoModal = new bootstrap.Modal(document.getElementById('searchPlantaoModal'))
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


document.getElementById("savePagamentoBtn").addEventListener("click", () => {
    savePagamento()
})


// ###############################
// ######### PAGAMENTOS ##########
// ###############################


async function loadPagamento() {
    let filterField = document.getElementById("filter_type").value;
    let filterValue = document.getElementById("filter_value").value.trim();
    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField);
        params.append("filter_value", filterValue);
    }

    getData(`/api/pagamento/?${params.toString()}`, (data) => {
        renderPagamentos(data.results)
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
                    <label class="small fw-bold">Código Interno</label>
                    <span class="small d-block">${pagamento.codigo_interno}</span>
                </div>

                <div class="col-4 col-md">
                    <label class="small fw-bold">Plantão</label>
                    <span class="small d-block">${pagamento.plantao_detalhe.codigo_interno}</span>
                </div>

                <div class="col-4 col-md">
                    <label class="small fw-bold">Regra</label>
                    <span class="small d-block">${pagamento.plantao_detalhe.regra_pagamento_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="small fw-bold">Cuidador(a)</label>
                    <span class="small d-block">${pagamento.plantao_detalhe.cuidadora_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="small fw-bold">Paciente</label>
                    <span class="small d-block">${pagamento.plantao_detalhe.paciente_detalhe.nome}</span>
                </div>
                <div class="col-4 col-md">
                    <label class="small fw-bold">Status</label>
                    <span class="small d-block">${pagamento.status_name}</span>
                </div>

                <div class="col-4 col-md">
                    <label class="small fw-bold">Valor</label>
                    <span class="small d-block">
                        ${Number(pagamento.valor_calculado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>

                <div class="col-2 col-md-auto text-md-end mt-2 mt-md-0">
                    <a href="#" class="text-decoration-none btn-modern btn-sm me-1" data-pagamento='${JSON.stringify(pagamento)}' onclick="abrirEditarPagamentoModal(this)">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <a href="#" class="text-decoration-none btn-modern btn-sm" id="deletarPagamentoBtn">
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
    }

    if (pagamentoId) {
        patchData(url, data, () => {
            pagamentoModal.hide()
            loadPagamento()
        })
    } else {
        saveData(url, data, () => {
            pagamentoModal.hide()
            loadPagamento()
        })
    }
}


function abrirNovoPagamentoModal() {
    document.getElementById("pagamento_id_modal_pagamentos").value = ""
    document.getElementById("plantao_codigo_modal_pagamentos").value = ""
    document.getElementById("plantao_id_modal_pagamentos").value = ""
    document.getElementById("cuidadora_id_modal_pagamentos").value = ""
    document.getElementById("cuidadora_nome_modal_pagamentos").value = ""
    document.getElementById("paciente_id_modal_pagamentos").value = ""
    document.getElementById("paciente_nome_modal_pagamentos").value = ""

    document.getElementById("pagamentoModalLabel").innerText = "Novo Pagamento"

    getRegraPagamentos();
    pagamentoModal.show()
}


function abrirEditarPagamentoModal(element) {
    const pagamento = JSON.parse(element.dataset.pagamento);

    document.getElementById("pagamento_id_modal_pagamentos").value = pagamento.id
    document.getElementById("plantao_codigo_modal_pagamentos").value = pagamento.codigo_interno
    document.getElementById("plantao_id_modal_pagamentos").value = pagamento.plantao
    document.getElementById("cuidadora_id_modal_pagamentos").value = pagamento.plantao_detalhe.cuidadora
    document.getElementById("cuidadora_nome_modal_pagamentos").value = pagamento.plantao_detalhe.cuidadora_detalhe.nome
    document.getElementById("paciente_id_modal_pagamentos").value = pagamento.plantao_detalhe.paciente
    document.getElementById("paciente_nome_modal_pagamentos").value = pagamento.plantao_detalhe.paciente_detalhe.nome
    document.getElementById("valor_calculado_modal_pagamentos").value = pagamento.valor_calculado
    document.getElementById("status_modal_pagamentos").value = pagamento.status

    document.getElementById("pagamentoModalLabel").innerText = `Editar Pagamento - ${pagamento.codigo_interno}`

    getRegraPagamentos();
    pagamentoModal.show()
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
                    <label class="small fw-bold">Cuidador(a)</label>
                    <span class="small d-block">${plantao.cuidadora_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="small fw-bold">Paciente</label>
                    <span class="small d-block">${plantao.paciente_detalhe.nome}</span>
                </div>
                <div class="col-4 col-md">
                    <label class="small fw-bold">Status</label>
                    <span class="small d-block">${plantao.status_name}</span>
                </div>

                <div class="col-2 col-md-auto text-md-end mt-2 mt-md-0">
                    <a href="#" 
                        class="text-decoration-none btn-modern btn-sm me-1" 
                        id="selecionarPlantaoBtn" 
                        data-cuidadora_id="${plantao.cuidadora}"
                        data-cuidadora_nome="${plantao.cuidadora_detalhe.nome}"
                        data-paciente_id="${plantao.paciente}"
                        data-paciente_nome="${plantao.paciente_detalhe.nome}"
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
        const cuidadoraId = button.getAttribute("data-cuidadora_id");
        const cuidadoraNome = button.getAttribute("data-cuidadora_nome");
        const pacienteId = button.getAttribute("data-paciente_id");
        const pacienteNome = button.getAttribute("data-paciente_nome");
        const regraPagamentoId = button.getAttribute("data-regra_pagamento_id");
        const codigoInterno = button.getAttribute("data-codigo_interno");
        const plantaoId = button.getAttribute("data-id");

        document.getElementById("cuidadora_id_modal_pagamentos").value = cuidadoraId;
        document.getElementById("cuidadora_nome_modal_pagamentos").value = cuidadoraNome;
        document.getElementById("paciente_id_modal_pagamentos").value = pacienteId;
        document.getElementById("paciente_nome_modal_pagamentos").value = pacienteNome;
        document.getElementById("regra_pagamento_id_modal_pagamentos").value = regraPagamentoId;
        document.getElementById("plantao_codigo_modal_pagamentos").value = codigoInterno;
        document.getElementById("plantao_id_modal_pagamentos").value = plantaoId;

        searchPlantaoModal.hide();
    }
});


// ###############################
// ######### PAGAMENTOS ##########
// ###############################


function getRegraPagamentos() {
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
