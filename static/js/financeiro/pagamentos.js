let pagamentoModal;
let searchPlantaoModal;

document.addEventListener("DOMContentLoaded", () => {
    loadRegraPagamento()
    pagamentoModal = new bootstrap.Modal(document.getElementById('pagamentoModal'))
    searchPlantaoModal = new bootstrap.Modal(document.getElementById('searchPlantaoModal'))
})

document.getElementById("novoPagamentoBtn").addEventListener("click", () => {
    abrirNovoPagamentoModal()
})

document.getElementById("abrirSearchPlantao").addEventListener("click", () => {
    openSearchPlantaoModal()
})

async function loadRegraPagamento() {
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
                    <a href="#" class="text-decoration-none btn-modern btn-sm me-1" id="editarPagamentoBtn">
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

function abrirNovoPagamentoModal() {
    pagamentoModal.show()
}


function openSearchPlantaoModal() {
    searchPlantaoModal.show()
}