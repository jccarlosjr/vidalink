let relatorioModal;
let searchCuidadoraModal;

// #####################################
// ############# LISTENERS #############
// #####################################

document.addEventListener("DOMContentLoaded", function () {
    relatorioModal = new bootstrap.Modal(document.getElementById("relatorioModal"));
    searchCuidadoraModal = new bootstrap.Modal(document.getElementById("searchCuidadoraModal"));
});

// #####################################
// ############# RELATORIOS ############
// #####################################


document.getElementById("novoRelatorioBtn").addEventListener("click", function () {
    abrirModalNovoRelatorio();
});


function abrirModalNovoRelatorio() {
    relatorioModal.show();
}

// #####################################
// ############# CUIDADORAS ############
// #####################################

document.getElementById("abrirSearchCuidadoraModal").addEventListener("click", function () {
    openSearchCuidadoraModal();
    relatorioModal.hide();
})

function openSearchCuidadoraModal() {
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
        row.className = "row g-2 border-bottom pb-2 mb-2 align-items-center";
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
    searchCuidadoraModal.hide();
    relatorioModal.show();
}