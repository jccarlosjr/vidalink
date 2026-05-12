let relatorioModal;
let searchProfissionalModal;
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
    searchProfissionalModal = new bootstrap.Modal(document.getElementById("searchProfissionalModal"));
    searchPagamentoModal = new bootstrap.Modal(document.getElementById("searchPagamentoModal"));
    detalhesModal = new bootstrap.Modal(document.getElementById("detalhesModal"));
    loadRelatorios();
});

document.getElementById("filter_btn").addEventListener("click", loadRelatorios);
document.getElementById("clear_filter_btn").addEventListener("click", clearFilters);

function clearFilters() {
    document.getElementById("filter_type").value = "codigo_interno";
    document.getElementById("filter_value").value = "";
    loadRelatorios();
}


// #####################################
// ############# RELATORIOS ############
// #####################################

document.getElementById("novoRelatorioBtn").addEventListener("click", abrirModalNovoRelatorio);

function abrirModalNovoRelatorio() {
    document.getElementById("relatorio_id_modal_relatorio").value = "";
    document.getElementById("profissional_id_modal_relatorio").value = "";
    document.getElementById("profissional_nome_modal_relatorio").value = "";
    document.getElementById("status_modal_relatorio").value = "ABERTO";
    document.getElementById("data_referencia_modal_relatorio").value = "";
    document.getElementById("pagamentos_list_relatorio").innerHTML = "";
    document.getElementById("deducoes_modal_relatorio").value = "";
    document.getElementById("liquido_modal_relatorio").value = "";
    relatorioModal.show();
}

function renderPaginationDRF(pagination, callback) {
    let container = document.getElementById("pagination")

    let html = `<div class="d-flex justify-content-center gap-2 mt-4">`

    html += `
        <button class="btn-modern"
            ${!pagination.previous ? "disabled" : ""}
            onclick="loadRelatorios('${pagination.previous}')">
            ← Anterior
        </button>
    `

    html += `
        <button class="btn-modern"
            ${!pagination.next ? "disabled" : ""}
            onclick="loadRelatorios('${pagination.next}')">
            Próxima →
        </button>
    `

    html += `</div>`

    container.innerHTML = html
}

function getValorTotal() {
    let valor = 0;
    pagamentos_selecionados.forEach(pagamento => {
        valor += Number(pagamento.valor_calculado);
    })
    return valor;
}


function calcularLiquido() {
    let valor_total = getValorTotal();
    let deducoes = document.getElementById("deducoes_modal_relatorio").value;
    let liquido = valor_total - Number(deducoes);
    document.getElementById("liquido_modal_relatorio").value = liquido;
}

document.getElementById("deducoes_modal_relatorio").addEventListener("input", calcularLiquido);

function saveRelatorio() {
    let relatorio_id = document.getElementById("relatorio_id_modal_relatorio").value;
    let profissional = document.getElementById("profissional_id_modal_relatorio").value;
    let status = document.getElementById("status_modal_relatorio").value;
    let data_referencia = document.getElementById("data_referencia_modal_relatorio").value;
    let valor_total = getValorTotal();
    let deducoes = document.getElementById("deducoes_modal_relatorio")?.value || 0;
    let liquido = document.getElementById("liquido_modal_relatorio").value;

    if (!profissional) showToast("Selecione um(a) profissional", "warning")
    if (!data_referencia) showToast("Selecione uma data de referência", "warning")
    if (pagamentos_selecionados.length == 0) showToast("Selecione pelo menos um pagamento", "warning")

    if (!profissional || !data_referencia || pagamentos_selecionados.length == 0) return;

    let data = {
        "profissional": profissional,
        "status": status,
        "data_referencia": data_referencia,
        "valor_total": valor_total,
        "deducoes": deducoes,
        "valor_liquido": liquido,
    }

    if (relatorio_id) {
        patchData(`/api/relatorios/${relatorio_id}/`, data, (relatorio) => {
            pagamentos_selecionados.forEach(pagamento => {
                let data = {
                    "relatorio": relatorio.id,
                    "status": "ADICIONADO_RELATORIO",
                }
                if (pagamento.status == "PENDENTE") {
                    patchData(`/api/pagamento/${pagamento.id}/`, data)
                }
            })
            relatorioModal.hide()
            showToast("Relatório criado com sucesso", "success")
            pagamentos_selecionados = [];
            loadRelatorios()
        })
    } else {
        saveData("/api/relatorios/", data, (relatorio) => {
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

    location.reload();
}

document.getElementById("saveRelatorioBtn").addEventListener("click", saveRelatorio);

function loadRelatorios(url = null) {
    const filter_type = document.getElementById("filter_type").value;
    const filter_value = document.getElementById("filter_value").value;

    const params = new URLSearchParams()

    if (filter_value) {
        params.append("filter_type", filter_type);
        params.append("filter_value", filter_value);
    }

    const container = document.getElementById("relatorios_list");
    container.innerHTML = "";

    const endpoint = url || `/api/relatorios/?${params.toString()}`

    getData(endpoint, (data) => {
        renderRelatorios(data.results)

        renderPaginationDRF({
            next: data.next,
            previous: data.previous
        })
    })
}


function renderRelatorios(relatorios) {
    const container = document.getElementById("relatorios_list");
    container.innerHTML = "";

    if (!relatorios.length) {
        container.innerHTML = `
            <div class="alert alert-light text-center m-3" role="alert">
                Nenhum relatório encontrado.
            </div>
        `
        return
    }

    relatorios.forEach(relatorio => {
        const disableBtn = relatorio.status != "PAGO" ? "" : "disabled";

        let btnDelete = "";
        if (relatorio.pagamentos_count == 0) {
            btnDelete = `
                    <button class="btn-modern btn-sm text-danger" title="Excluir" onclick="excluirRelatorio(${relatorio.id})"><i class="bi bi-trash"></i></button>
                `
        }

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
                    <label class="fw-bold">Profissional</label>
                    <span class="small text-muted d-block">${relatorio.profissional_detalhe.nome}</span>
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
                    <label class="fw-bold">Valor Líquido</label>
                    <span class="small text-muted d-block">${Number(relatorio.valor_liquido).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div class="col-4 col-md">
                    <button class="btn-modern btn-sm text-success" ${disableBtn} data-confirm='${JSON.stringify(relatorio)}' title="Confirmar pagamento" onclick="confirmarRelatorio(this)"><i class="bi bi-currency-dollar"></i></button>
                    <button class="btn-modern btn-sm" title="Editar" data-edit='${JSON.stringify(relatorio)}' onclick="editarRelatorio(this)"><i class="bi bi-pencil"></i></button>
                    <button class="btn-modern btn-sm" title="Visualizar" data-view='${JSON.stringify(relatorio)}' onclick="visualizarRelatorio(this)"><i class="bi bi-eye"></i></button>
                    ${btnDelete}
                </div>
            `;
        container.appendChild(linha);
    })
}

function editarRelatorio(element) {
    let relatorio = JSON.parse(element.dataset.edit);
    document.getElementById("relatorio_id_modal_relatorio").value = relatorio.id;
    document.getElementById("profissional_id_modal_relatorio").value = relatorio.profissional;
    document.getElementById("profissional_nome_modal_relatorio").value = relatorio.profissional_detalhe.nome;
    document.getElementById("status_modal_relatorio").value = relatorio.status;
    document.getElementById("data_referencia_modal_relatorio").value = relatorio.data_referencia;
    document.getElementById("deducoes_modal_relatorio").value = relatorio.deducoes;
    document.getElementById("liquido_modal_relatorio").value = relatorio.valor_liquido;
    pagamentos_selecionados = relatorio.pagamentos;
    renderPagamentosRelatorio();
    relatorioModal.show();
}

function visualizarRelatorio(element) {
    let relatorio = JSON.parse(element.dataset.view);

    document.getElementById("codigo_interno_detalhe_modal").innerHTML = relatorio.codigo_interno;
    document.getElementById("profissional_nome_detalhe_modal").innerHTML = relatorio.profissional_detalhe.nome;
    document.getElementById("status_detalhe_modal").innerHTML = relatorio.status_name;
    document.getElementById("data_referencia_detalhe_modal").innerHTML = maskData(relatorio.data_referencia);
    document.getElementById("valor_total_detalhe_modal").innerHTML = Number(relatorio.valor_total).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    document.getElementById("deducoes_detalhe_modal").innerHTML = Number(-relatorio.deducoes).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    document.getElementById("liquido_detalhe_modal").innerHTML = Number(relatorio.valor_liquido).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    document.getElementById("profissional_codigo_banco_detalhe_modal").innerHTML = relatorio.profissional_detalhe.codigo_banco;
    document.getElementById("profissional_agencia_conta_detalhe_modal").innerHTML = relatorio.profissional_detalhe.agencia_conta;
    document.getElementById("profissional_numero_conta_detalhe_modal").innerHTML = relatorio.profissional_detalhe.numero_conta;
    document.getElementById("chave_pix_detalhe_modal").innerHTML = relatorio.profissional_detalhe.chave_pix;
    document.getElementById("cnpj_detalhe_modal").innerHTML = relatorio.profissional_detalhe.cnpj;
    document.getElementById("cpf_detalhe_modal").innerHTML = relatorio.profissional_detalhe.cpf;

    renderPagamentosRelatorioDetalhe(relatorio.pagamentos);

    detalhesModal.show();
}

function renderPagamentosRelatorioDetalhe(pagamentos) {
    let container = document.getElementById("pagamentos_list_detalhe_modal");
    container.innerHTML = "";
    pagamentos.forEach(pagamento => {
        const linha = document.createElement("div");
        linha.className = "row p-1 border align-items-center";
        linha.innerHTML = `
            <div class="col-4 col-md text-center">
                <small class="d-block">${pagamento.codigo_interno}</small>
            </div>
            <div class="col-4 col-md text-center">
                <small class="d-block">${pagamento.status_name}</small>
            </div>
            <div class="col-4 col-md text-center">
                <small class="d-block">${Number(pagamento.valor_calculado).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</small>
            </div>
        `;
        container.appendChild(linha);
    })
}

function confirmarRelatorio(element) {
    const relatorio = JSON.parse(element.getAttribute("data-confirm"));

    const agora = new Date();
    const dataFormatada = agora.toISOString().slice(0, 16);

    const data = {
        status: "PAGO",
        fechado_em: dataFormatada,
    }

    patchData(`/api/relatorios/${relatorio.id}/`, data, () => {
        showToast("Relatório confirmado com sucesso", "success");

        relatorio.pagamentos.forEach(pagamento => {
            const hoje = new Date().toISOString().split('T')[0];

            const dataPagamento = {
                status: "PAGO",
                data_pagamento: hoje,
                valor_pago: pagamento.valor_calculado
            }

            patchData(`/api/pagamento/${pagamento.id}/update_status/`, dataPagamento, () => {
                showToast("Pagamento confirmado com sucesso", "success");
            })
        })
        loadRelatorios();
    })
    location.reload();
}

function excluirRelatorio(id) {
    if (confirm("Tem certeza que deseja excluir este relatório?")) {
        deleteData(`/api/relatorios/${id}/`, () => {
            showToast("Relatório excluído com sucesso", "success");
            loadRelatorios();
        })
    }
}

// #####################################
// ############# PROFISSIONAIS #########
// #####################################

document.getElementById("abrirSearchProfissionalModal").addEventListener("click", function () {
    openSearchProfissionalModal();
    relatorioModal.hide();
})

function openSearchProfissionalModal() {
    document.getElementById("filter_type_profissional").value = "nome";
    document.getElementById("filter_value_profissional").value = "";
    document.getElementById("result_profissional").innerHTML = "";
    searchProfissionalModal.show();
}

function loadProfissional() {
    let filter_type = document.getElementById("filter_type_profissional").value;
    let filter_value = document.getElementById("filter_value_profissional").value;

    const params = new URLSearchParams();

    if (filter_type && filter_value) {
        params.append("filter_type", filter_type);
        params.append("filter_value", filter_value);
    }

    getData(`/api/profissionais/?${params.toString()}`, (data) => {
        renderProfissionaisSearch(data.results);
    })
}

function renderProfissionaisSearch(profissionais) {
    const container = document.getElementById("result_profissional");
    container.innerHTML = "";

    profissionais.forEach((profissional) => {
        const row = document.createElement("div");
        row.className = "row g-2 border-bottom border-top pb-2 mb-2 mt-2 align-items-center";
        row.innerHTML = `
            <div class="col-4 col-md text-center">
                <label class="fw-bold">Nome</label>
                <span class="small text-muted d-block">${profissional.nome}</span>
            </div>
            <div class="col-4 col-md text-center">
                <label class="fw-bold">CPF</label>
                <span class="small text-muted d-block">${profissional.cpf}</span>
            </div>
            <div class="col-4 col-md text-center">
                <label class="fw-bold">CNPJ</label>
                <span class="small text-muted d-block">${profissional.cnpj}</span>
            </div>
            <div class="col-4 col-md">
                <button class="btn-modern btn-sm" onclick="selecionarProfissional(${profissional.id}, '${profissional.nome}')"><i class="bi bi-check-circle"></i> Selecionar</button>
            </div>
        `;
        container.appendChild(row);
    });
}

document.getElementById("filter_btn_profissional").addEventListener("click", function () {
    loadProfissional();
})

document.getElementById("clear_filter_btn_profissional").addEventListener("click", function () {
    clearFilterProfissional();
})

function clearFilterProfissional() {
    document.getElementById("filter_type_profissional").value = "profissional__nome";
    document.getElementById("filter_value_profissional").value = "";
    loadProfissional();
}

function selecionarProfissional(id, nome) {
    document.getElementById("profissional_id_modal_relatorio").value = id;
    document.getElementById("profissional_nome_modal_relatorio").value = nome;
    document.getElementById("pagamentos_list_relatorio").innerHTML = "";
    pagamentos_selecionados = [];
    searchProfissionalModal.hide();
    relatorioModal.show();
}

// #####################################
// ############# PAGAMENTOS ############
// #####################################

document.getElementById('adicionarPagamentoBtnRelatorio').addEventListener("click", function () {
    let profissional = document.getElementById("profissional_id_modal_relatorio").value;
    if (!profissional) {
        showToast("Selecione um(a) profissional.", "warning");
        return;
    }
    loadPagamentos();
    searchPagamentoModal.show();
    relatorioModal.hide();
})

async function loadPagamentos() {
    let profissional = document.getElementById("profissional_id_modal_relatorio").value;
    if (!profissional) {
        showToast("Selecione um(a) profissional.", "warning");
        return;
    }

    const params = new URLSearchParams()

    params.append("profissional", profissional);
    params.append("status", "PENDENTE");

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
                    <label class="fw-bold">Profissional</label>
                    <span class="small text-muted d-block">${pagamento.plantao_detalhe.profissional_detalhe.nome}</span>
                </div>
                <div class="col-6 col-md">
                    <label class="fw-bold">Assistido</label>
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
    calcularLiquido();
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
                    <button type="button" class="btn-modern btn-sm" data-pagamento='${JSON.stringify(pagamento)}' onclick="editPagamento(this)">
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
    calcularLiquido();
}

function editPagamento(btn) {
    const pagamento = JSON.parse(btn.dataset.pagamento);

    if (pagamento.status === "PENDENTE") {
        removerPagamentoRelatorio(btn)
    };

    const url = `/api/pagamento/${pagamento.id}/update_status/`
    const data = {
        status: "PENDENTE",
        relatorio: null
    }

    patchData(url, data, () => {
        removerPagamentoRelatorio(btn)
    })
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
    calcularLiquido();
}

document.getElementById("btnAdicionarTodos").addEventListener("click", adicionarTodosPagamentos);

function imprimirDetalhesModal() {
    const conteudo = document.getElementById("detalhesModal").innerHTML;

    const janelaImpressao = window.open('', '', 'width=800,height=600');

    janelaImpressao.document.write(`
        <html>
            <head>
                <title>Impressão</title>

                <link 
                    rel="stylesheet" 
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                >

                <style>
                    body {
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }

                    .no-print {
                        display: none !important;
                    }
                </style>
            </head>

            <body>
                ${conteudo}
            </body>
        </html>
    `);

    janelaImpressao.document.close();

    janelaImpressao.onload = function () {
        janelaImpressao.focus();
        janelaImpressao.print();
        janelaImpressao.close();
    };
}