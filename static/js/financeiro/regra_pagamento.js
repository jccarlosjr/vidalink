let regraPagamentoModal

document.addEventListener("DOMContentLoaded", () => {
    loadRegraPagamento()
    regraPagamentoModal = new bootstrap.Modal(document.getElementById("regraPagamentoModal"))
})

document.getElementById("filter_btn").addEventListener("click", loadRegraPagamento);
document.getElementById("clear_filter_btn").addEventListener("click", clearFilter);
document.getElementById("novaRegraPagamentoBtn").addEventListener("click", abrirNovaRegraPagamentoModal);


function clearFilter() {
    document.getElementById("filter_type").value = ""
    document.getElementById("filter_value").value = ""
    document.getElementById("filter_active").checked = true
    loadRegraPagamento()
}


async function loadRegraPagamento() {
    let filterField = document.getElementById("filter_type").value;
    let filterValue = document.getElementById("filter_value").value.trim();
    let checked = document.getElementById("filter_active").checked;
    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField);
        params.append("filter_value", filterValue);
    } else if (checked) {
        params.append("ativa", true);
    } else if (!checked) {
        params.append("ativa", false);
    }

    getData(`/api/regra-pagamento/?${params.toString()}`, (data) => {
        renderRegraPagamento(data.results)
    })
}


function renderRegraPagamento(data) {
    const table = document.getElementById("table-regras-pagamento")
    const tbody = table.getElementsByTagName("tbody")[0]
    tbody.innerHTML = ""
    data.forEach(regra => {
        let btn_active, icon_btn

        if (regra.ativa) {
            btn_active = "Desativar"
            icon_btn = "<i class='bi bi-x-circle'></i>"
        } else {
            btn_active = "Ativar"
            icon_btn = "<i class='bi bi-check-circle'></i>"
        }

        const row = tbody.insertRow()
        row.classList.add("text-center")
        row.dataset.regra = JSON.stringify(regra)
        row.insertCell().innerText = regra.nome
        row.insertCell().innerText = regra.tipo_name
        row.insertCell().innerText = Number(regra.valor_base).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        row.insertCell().innerText = new Date(regra.data_inicio).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        row.insertCell().innerText = regra.ativa ? "Ativo" : "Inativo"
        row.insertCell().innerHTML = `
            <button class="btn-modern btn-sm" title="Editar" onclick="abrirEditRegraPagamentoModal(this)"><i class="bi bi-pencil-square"></i></button>
            <button class="btn-modern btn-sm" title="${btn_active}" onclick="toggleActive(${regra.id})">${icon_btn}</button>
            `
    });
}


function toggleActive(id) {
    getData(`/api/regra-pagamento/${id}/`, (data) => {
        data.ativa = !data.ativa
        patchData(`/api/regra-pagamento/${id}/`, data, (data) => {
            loadRegraPagamento()
        })
    })
}


function abrirNovaRegraPagamentoModal() {
    document.getElementById("regraPagamentoModalLabel").innerText = "Nova Regra de Pagamento"
    document.getElementById("id_regra").value = ""
    document.getElementById("nome_regra").value = ""
    document.getElementById("tipo_regra").value = ""
    document.getElementById("valor_base").value = ""
    document.getElementById("data_fim").value = ""
    regraPagamentoModal.show()
}


function abrirEditRegraPagamentoModal(button) {
    const regra = JSON.parse(button.closest("tr").dataset.regra)
    document.getElementById("regraPagamentoModalLabel").innerText = "Editar Regra de Pagamento"
    document.getElementById("id_regra").value = regra.id
    document.getElementById("nome_regra").value = regra.nome
    document.getElementById("tipo_regra").value = regra.tipo
    document.getElementById("valor_base").value = regra.valor_base
    document.getElementById("data_fim").value = regra.data_fim
    regraPagamentoModal.show()
}


document.getElementById("saveRegraPagamentoBtn").addEventListener("click", saveRegraPagamento)


function saveRegraPagamento() {

    const regra = {
        nome: document.getElementById("nome_regra").value,
        tipo: document.getElementById("tipo_regra").value,
        valor_base: document.getElementById("valor_base").value,
    }

    let data_fim = document.getElementById("data_fim").value
    let id = document.getElementById("id_regra").value

    if (data_fim) {
        regra.data_fim = data_fim
    }

    if (id) {
        regra.id = Number(id)
        patchData(`/api/regra-pagamento/${regra.id}/`, regra, (data) => {
            loadRegraPagamento()
            regraPagamentoModal.hide()
        })
    } else {
        saveData(`/api/regra-pagamento/`, regra, (data) => {
            loadRegraPagamento()
            regraPagamentoModal.hide()
        })
    }
}
