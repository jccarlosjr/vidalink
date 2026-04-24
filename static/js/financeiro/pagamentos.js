document.addEventListener("DOMContentLoaded", () => {
    loadRegraPagamento()
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
        const linha = document.createElement('tr')
        linha.className = "col-lg-6 mb-4 text-center"
        linha.innerHTML = `
            <tr>
                <td class="small">${pagamento.codigo_interno}</td>
                <td class="small">${pagamento.plantao_detalhe.codigo_interno}</td>
                <td class="small">${pagamento.plantao_detalhe.regra_pagamento_detalhe.nome}</td>
                <td class="small">${pagamento.status_name}</td>
                <td class="small">${pagamento.valor_calculado}</td>
                <td>
                    <a href="#" class="text-decoration-none btn-modern btn-sm" id="editarPagamentoBtn">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <a href="#" class="text-decoration-none btn-modern btn-sm" id="deletarPagamentoBtn">
                        <i class="bi bi-trash"></i>
                    </a>
                </td>
            </tr>
        `
        container.appendChild(linha)
    });
}