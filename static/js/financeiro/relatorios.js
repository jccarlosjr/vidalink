let relatorioModal;
let searchCuidadoraModal;
let searchPagamentoModal;
let detalhesModal;
let pagamentos_selecionados = [];


function maskData(dataISO) {
    if (!dataISO) return '';

    const [ano, mes] = dataISO.split('-');
    const data = new Date(ano, mes - 1);

    const mesNome = new Intl.DateTimeFormat('pt-BR', {
        month: 'long'
    }).format(data);

    return `${mesNome}/${ano}`;
}

// #####################################
// ############# LISTENERS #############
// #####################################

document.addEventListener("DOMContentLoaded", function () {
    relatorioModal = new bootstrap.Modal(document.getElementById("relatorioModal"));
    searchCuidadoraModal = new bootstrap.Modal(document.getElementById("searchCuidadoraModal"));
    searchPagamentoModal = new bootstrap.Modal(document.getElementById("searchPagamentoModal"));
    detalhesModal = new bootstrap.Modal(document.getElementById("detalhesModal"));
    loadRelatorios();
});

// #####################################
// ############# RELATORIOS ############
// #####################################

document.getElementById("novoRelatorioBtn").addEventListener("click", abrirModalNovoRelatorio);

function abrirModalNovoRelatorio() {
    document.getElementById("cuidadora_id_modal_relatorio").value = "";
    document.getElementById("cuidadora_nome_modal_relatorio").value = "";
    document.getElementById("status_modal_relatorio").value = "ABERTO";
    document.getElementById("data_referencia_modal_relatorio").value = "";
    document.getElementById("pagamentos_list_relatorio").innerHTML = "";
    relatorioModal.show();
}

function getValorTotal() {
    let valor = 0;
    pagamentos_selecionados.forEach(pagamento => {
        valor += Number(pagamento.valor_calculado);
    })
    return valor;
}

function saveRelatorio() {
    let cuidadora = document.getElementById("cuidadora_id_modal_relatorio").value;
    let status = document.getElementById("status_modal_relatorio").value;
    let data_referencia = document.getElementById("data_referencia_modal_relatorio").value;
    let valor_total = getValorTotal();

    const url = "/api/relatorios/"

    if (!cuidadora) showToast("Selecione um(a) cuidador(a)", "warning")
    if (!data_referencia) showToast("Selecione uma data de referência", "warning")
    if (pagamentos_selecionados.length == 0) showToast("Selecione pelo menos um pagamento", "warning")

    if (!cuidadora || !data_referencia || pagamentos_selecionados.length == 0) return;

    let data = {
        "cuidadora": cuidadora,
        "status": status,
        "data_referencia": data_referencia,
        "valor_total": valor_total,
    }

    saveData(url, data, (relatorio) => {
        pagamentos_selecionados.forEach(pagamento => {
            let data = {
                "relatorio": relatorio.id,
                "status": "ADICIONADO_RELATORIO",
            }
            patchData(`/api/pagamento/${pagamento.id}/`, data)
        })
        relatorioModal.hide()
        showToast("Relatório criado com sucesso", "success")
        pagamentos_selecionados = [];
        loadRelatorios()
    })
}

document.getElementById("saveRelatorioBtn").addEventListener("click", saveRelatorio);

function loadRelatorios() {
    const container = document.getElementById("relatorios_list");
    container.innerHTML = "";

    getData("/api/relatorios/", (data) => {
        data.results.forEach(relatorio => {
            const linha = document.createElement("div");
            linha.className = "row g-2 pb-2 mb-1 border-bottom align-items-center";
            linha.innerHTML = `
                <div class="col-4 col-md text-center">
                    <label class="fw-bold">Código Interno</label>
                    <span class="small text-muted d-block">${relatorio.codigo_interno}</span>
                </div>
                <div class="col-4 col-md text-center">
                    <label class="fw-bold">Status</label>
                    <span class="small text-muted d-block">${relatorio.status_name}</span>
                </div>
                <div class="col-4 col-md text-center">
                    <label class="fw-bold">Cuidador(a)</label>
                    <span class="small text-muted d-block">${relatorio.cuidadora_detalhe.nome}</span>
                </div>
                <div class="col-4 col-md text-center">
                    <label class="fw-bold">Pagamentos</label>
                    <span class="small text-muted d-block">${relatorio.pagamentos_count}</span>
                </div>
                <div class="col-4 col-md text-center">
                    <label class="fw-bold">Referência</label>
                    <span class="small text-muted d-block">${maskData(relatorio.data_referencia) || 'sem data'}</span>
                </div>
                <div class="col-4 col-md text-center">
                    <label class="fw-bold">Valor</label>
                    <span class="small text-muted d-block">${Number(relatorio.valor_total).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div class="col-4 col-md">
                    <button class="btn-modern btn-sm text-success" title="Confirmar pagamento" onclick="confirmarRelatorio(${relatorio.id})"><i class="bi bi-currency-dollar"></i></button>
                    <button class="btn-modern btn-sm" title="Editar" data-edit='${JSON.stringify(relatorio)}' onclick="editarRelatorio(this)"><i class="bi bi-pencil"></i></button>
                    <button class="btn-modern btn-sm" title="Visualizar" data-view='${JSON.stringify(relatorio)}' onclick="visualizarRelatorio(this)"><i class="bi bi-eye"></i></button>
                </div>
            `;
            container.appendChild(linha);
        })
    })
}

function editarRelatorio(element) {
    let relatorio = JSON.parse(element.dataset.edit);
    document.getElementById("cuidadora_id_modal_relatorio").value = relatorio.cuidadora;
    document.getElementById("cuidadora_nome_modal_relatorio").value = relatorio.cuidadora_detalhe.nome;
    document.getElementById("status_modal_relatorio").value = relatorio.status;
    document.getElementById("data_referencia_modal_relatorio").value = relatorio.data_referencia;
    pagamentos_selecionados = relatorio.pagamentos;
    renderPagamentosRelatorio();
    relatorioModal.show();
}

function visualizarRelatorio(element) {
    let relatorio = JSON.parse(element.dataset.view);

    document.getElementById("codigo_interno_detalhe_modal").innerHTML = relatorio.codigo_interno;
    document.getElementById("cuidadora_nome_detalhe_modal").innerHTML = relatorio.cuidadora_detalhe.nome;
    document.getElementById("status_detalhe_modal").innerHTML = relatorio.status_name;
    document.getElementById("data_referencia_detalhe_modal").innerHTML = maskData(relatorio.data_referencia);
    document.getElementById("valor_total_detalhe_modal").innerHTML = Number(relatorio.valor_total).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    renderPagamentosRelatorioDetalhe(relatorio.pagamentos);

    detalhesModal.show();
}


function renderPagamentosRelatorioDetalhe(pagamentos) {
    let container = document.getElementById("pagamentos_list_detalhe_modal");
    container.innerHTML = "";
    pagamentos.forEach(pagamento => {
        const linha = document.createElement("div");
        linha.className = "row g-2 pb-2 mb-1 border-bottom align-items-center mt-2";
        linha.innerHTML = `
            <div class="col-4 col-md text-center">
                <label class="fw-bold">Código Interno</label>
                <span class="small text-muted d-block">${pagamento.codigo_interno}</span>
            </div>
            <div class="col-4 col-md text-center">
                <label class="fw-bold">Status</label>
                <span class="small text-muted d-block">${pagamento.status_name}</span>
            </div>
            <div class="col-4 col-md text-center">
                <label class="fw-bold">Cuidadora</label>
                <span class="small text-muted d-block">${pagamento.plantao_detalhe.cuidadora_detalhe.nome}</span>
            </div>
            <div class="col-4 col-md text-center">
                <label class="fw-bold">Valor</label>
                <span class="small text-muted d-block">${Number(pagamento.valor_calculado).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
            </div>
        `;
        container.appendChild(linha);
    })
}

// #####################################
// ############# CUIDADORAS ############
// #####################################

document.getElementById("abrirSearchCuidadoraModal").addEventListener("click", function () {
    openSearchCuidadoraModal();
    relatorioModal.hide();
})

function openSearchCuidadoraModal() {
    document.getElementById("filter_type_cuidadora").value = "nome";
    document.getElementById("filter_value_cuidadora").value = "";
    document.getElementById("result_cuidadora").innerHTML = "";
    searchCuidadoraModal.show();
}

function loadCuidadora() {
    let filter_type = document.getElementById("filter_type_cuidadora").value;
    let filter_value = document.getElementById("filter_value_cuidadora").value;

    const params = new URLSearchParams();

    if (filter_type && filter_value) {
        params.append("filter_type", filter_type);
        params.append("filter_value", filter_value);
    }

    getData(`/api/cuidadoras/?${params.toString()}`, (data) => {
        renderCuidadorasSearch(data.results);
    })
}

function renderCuidadorasSearch(cuidadoras) {
    const container = document.getElementById("result_cuidadora");
    container.innerHTML = "";

    cuidadoras.forEach((cuidadora) => {
        const row = document.createElement("div");
        row.className = "row g-2 border-bottom border-top pb-2 mb-2 mt-2 align-items-center";
        row.innerHTML = `
            <div class="col-4 col-md text-center">
                <label class="fw-bold">Nome</label>
                <span class="small text-muted d-block">${cuidadora.nome}</span>
            </div>
            <div class="col-4 col-md text-center">
                <label class="fw-bold">CPF</label>
                <span class="small text-muted d-block">${cuidadora.cpf}</span>
            </div>
            <div class="col-4 col-md text-center">
                <label class="fw-bold">CNPJ</label>
                <span class="small text-muted d-block">${cuidadora.cnpj}</span>
            </div>
            <div class="col-4 col-md">
                <button class="btn-modern btn-sm" onclick="selecionarCuidadora(${cuidadora.id}, '${cuidadora.nome}')"><i class="bi bi-check-circle"></i> Selecionar</button>
            </div>
        `;
        container.appendChild(row);
    });
}

document.getElementById("filter_btn_cuidadora").addEventListener("click", function () {
    loadCuidadora();
})

document.getElementById("clear_filter_btn_cuidadora").addEventListener("click", function () {
    clearFilterCuidadora();
})

function clearFilterCuidadora() {
    document.getElementById("filter_type_cuidadora").value = "cuidadora__nome";
    document.getElementById("filter_value_cuidadora").value = "";
    loadCuidadora();
}

function selecionarCuidadora(id, nome) {
    document.getElementById("cuidadora_id_modal_relatorio").value = id;
    document.getElementById("cuidadora_nome_modal_relatorio").value = nome;
    document.getElementById("pagamentos_list_relatorio").innerHTML = "";
    pagamentos_selecionados = [];
    searchCuidadoraModal.hide();
    relatorioModal.show();
}

// #####################################
// ############# PAGAMENTOS ############
// #####################################

document.getElementById('adicionarPagamentoBtnRelatorio').addEventListener("click", function () {
    let cuidadora = document.getElementById("cuidadora_id_modal_relatorio").value;
    if (!cuidadora) {
        showToast("Selecione um(a) cuidador(a).", "warning");
        return;
    }
    loadPagamentos();
    searchPagamentoModal.show();
    relatorioModal.hide();
})

async function loadPagamentos() {
    let cuidadora = document.getElementById("cuidadora_id_modal_relatorio").value;
    if (!cuidadora) {
        showToast("Selecione um(a) cuidador(a).", "warning");
        return;
    }

    const params = new URLSearchParams()

    if (cuidadora) {
        params.append("filter_type", "plantao__cuidadora");
        params.append("filter_value", cuidadora);
    }

    params.append("filter_type", "status");
    params.append("filter_value", "PENDENTE");

    getData(`/api/pagamento/?${params.toString()}`, (data) => {
        renderPagamentos(data.results)
    })
}

function renderPagamentos(pagamentos) {
    const container = document.getElementById('pagamentos_list')

    container.innerHTML = ""

    if (pagamentos.length == 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center">Nenhum pagamento encontrado.</div>
        `
        return;
    }

    pagamentos.forEach(pagamento => {
        if (!pagamentoJaAdicionado(pagamento)) {
            const linha = document.createElement('div')
            linha.className = "card p-2 mt-2 shadow-sm"
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
                    <label class="fw-bold">Cuidador(a)</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.cuidadora_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="fw-bold">Paciente</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.paciente_detalhe.nome}</span>
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
                    <button type="button" class="btn-modern btn-sm" data-pagamento='${JSON.stringify(pagamento)}' onclick="adicionarPagamentoRelatorio(this)">
                        <i class="bi bi-plus-circle"></i> Adicionar
                    </button>
                </div>

            </div>
        `
            container.appendChild(linha)
        }
    });
}

function pagamentoJaAdicionado(pagamento) {
    return pagamentos_selecionados.some(p => p.id === pagamento.id);
}

function adicionarPagamentoRelatorio(btn) {
    const pagamento = JSON.parse(btn.dataset.pagamento)

    if (pagamentoJaAdicionado(pagamento)) {
        showToast("Pagamento já foi adicionado!", "danger")
        searchPagamentoModal.hide();
        relatorioModal.show();
        return;
    }

    pagamentos_selecionados.push(pagamento)
    renderPagamentosRelatorio()
    searchPagamentoModal.hide();
    relatorioModal.show();
}

function renderPagamentosRelatorio() {
    const container = document.getElementById('pagamentos_list_relatorio')

    container.innerHTML = ""

    if (pagamentos_selecionados.length == 0) {
        container.innerHTML = `
            <div class="alert text-center">Nenhum pagamento selecionado.</div>
        `
        return;
    }

    pagamentos_selecionados.forEach(pagamento => {

        const linha = document.createElement('div')
        linha.className = "card p-2 mt-2 shadow-sm"
        linha.innerHTML = `
            <div class="row g-2 align-items-center">

                <div class="col-4 col-md">
                    <label class="fw-bold">Código Interno</label>
                    <span class="small text-muted d-block">${pagamento.codigo_interno}</span>
                </div>

                <div class="col-4 col-md">
                    <label class="fw-bold">Plantão</label>
                    <span class="small text-muted d-block">${pagamento.codigo_interno}</span>
                </div>

                <div class="col-4 col-md">
                    <label class="fw-bold">Regra</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.regra_pagamento_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="fw-bold">Cuidador(a)</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.cuidadora_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="fw-bold">Paciente</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.paciente_detalhe.nome}</span>
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
                    <button type="button" class="btn-modern btn-sm" data-pagamento='${JSON.stringify(pagamento)}' onclick="removerPagamentoRelatorio(this)">
                        <i class="bi bi-trash"></i> Remover
                    </button>
                </div>

            </div>
        `
        container.appendChild(linha)
    });
}

function removerPagamentoRelatorio(btn) {
    const pagamentoRemover = JSON.parse(btn.dataset.pagamento);

    pagamentos_selecionados = pagamentos_selecionados.filter(p => {
        if (p.id) return p.id !== pagamentoRemover.id;
        if (p.codigo_interno) return p.codigo_interno !== pagamentoRemover.codigo_interno;
        return JSON.stringify(p) !== JSON.stringify(pagamentoRemover);
    });

    const card = btn.closest('.card');
    if (card) {
        card.remove();
    }

    if (pagamentos_selecionados.length === 0) {
        renderPagamentosRelatorio();
    }
}

function adicionarTodosPagamentos() {
    document.getElementById("pagamentos_list").querySelectorAll(".card").forEach(card => {
        let pagamento = JSON.parse(card.querySelector("button").dataset.pagamento);
        if (!pagamentoJaAdicionado(pagamento)) {
            pagamentos_selecionados.push(pagamento);
        }
    })
    renderPagamentosRelatorio()
    searchPagamentoModal.hide();
    relatorioModal.show();
}

document.getElementById("btnAdicionarTodos").addEventListener("click", adicionarTodosPagamentos);

