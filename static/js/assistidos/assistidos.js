
// ############################################
// ############## LISTENNERS ##################
// ############################################
let novoAssistidoModal;
let detalhesAssistidoModal;
let deletarAssistidoModal;
let responsavelModal;
let novoResponsavelModal;
let deletarResponsavelModal;

document.addEventListener("DOMContentLoaded", () => {
    loadAssistidos()
    novoAssistidoModal = new bootstrap.Modal(document.getElementById("novoAssistidoModal"));
    detalhesAssistidoModal = new bootstrap.Modal(document.getElementById("detalhesAssistidoModal"));
    deletarAssistidoModal = new bootstrap.Modal(document.getElementById("deletarAssistidoModal"));
    responsavelModal = new bootstrap.Modal(document.getElementById("responsavelModal"));
    novoResponsavelModal = new bootstrap.Modal(document.getElementById("novoResponsavelModal"));
    deletarResponsavelModal = new bootstrap.Modal(document.getElementById("deletarResponsavelModal"));
});

document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault()
    loadAssistidos()
})


document.getElementById("novoAssistidoBtn").addEventListener("click", abrirModalNovoAssistido);
document.getElementById("saveNovoAssistidoBtn").addEventListener("click", salvarAssistido);
document.getElementById("deletarAssistidoBtn").addEventListener("click", deletarAssistido);
document.getElementById("adicionarResponsavelBtn").addEventListener("click", abrirModalNovoResponsavel);
document.getElementById("saveNovoResponsavelBtn").addEventListener("click", salvarResponsavel);
document.getElementById("deletarResponsavelBtn").addEventListener("click", deletarResponsavel);

document.getElementById("filter_btn").addEventListener("click", () => loadAssistidos());
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
// ############## RENDERS #####################
// ############################################
function clearFilter() {
    document.getElementById("filter_type").value = ""
    document.getElementById("filter_value").value = ""
    document.getElementById("filter_active").checked = true
    loadAssistidos()
}

function loadAssistidos(url = null) {
    let filterField = document.getElementById("filter_type").value
    let filterValue = document.getElementById("filter_value").value.trim()
    let checked = document.getElementById("filter_active").checked;

    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField);
        params.append("filter_value", filterValue);
    } else if (checked) {
        params.append("is_active", true);
    } else if (!checked) {
        params.append("is_active", false);
    }

    const endpoint = url || `/api/assistidos/?${params.toString()}`

    getData(endpoint, (data) => {
        renderAssistidos(data.results)

        renderPaginationDRF({
            next: data.next,
            previous: data.previous
        })
    })
}

function renderPaginationDRF(pagination) {
    let container = document.getElementById("pagination")

    let html = `<div class="d-flex justify-content-center gap-2 mt-4">`

    html += `
        <button class="btn-modern"
            ${!pagination.previous ? "disabled" : ""}
            onclick="loadAssistidos('${pagination.previous}')">
            ← Anterior
        </button>
    `

    html += `
        <button class="btn-modern"
            ${!pagination.next ? "disabled" : ""}
            onclick="loadAssistidos('${pagination.next}')">
            Próxima →
        </button>
    `

    html += `</div>`

    container.innerHTML = html
}

function renderAssistidos(items = []) {
    let container = document.getElementById("table-assistidos")
    container.innerHTML = ""

    if (items.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                Nenhum assistido encontrado.
            </div>
        `
        return;
    }

    let html = `<div class="row g-3">`

    items.forEach(item => {
        let badge, icon, text;
        let iconActive
        let title
        const ativa = item.ativo
        let badgeActive;


        if (item.sexo == "M") {
            badge = "badge bg-primary bg-opacity-10 text-primary border border-primary-subtle rounded-pill"
            icon = "bi bi-gender-male me-1"
            text = " Masculino"
        } else if (item.sexo == "F") {
            badge = "badge bg-danger bg-opacity-10 text-danger border border-danger-subtle rounded-pill"
            icon = "bi bi-gender-female me-1"
            text = " Feminino"
        } else {
            badge = "badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle rounded-pill"
            icon = "bi bi-gender-neutral me-1"
            text = assistido.sexo
        }

        if (ativa) {
            badgeActive = ""
            iconActive = "bi-check-circle text-success"
            title = "Ativa"
        } else {
            badgeActive = "<span class='badge bg-danger'>assistido Inativo(a)</span>"
            iconActive = "bi-x-circle text-danger"
            title = "Inativa"
        }


        const enderecoCompleto = `${item.endereco}, ${item.numero}, ${item.complemento}, ${item.bairro}, ${item.cidade}-${item.estado}, ${item.cep}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
        const telefoneLimpo = item.telefone.replace(/\D/g, "");

        html += `
        <div class="col-12 col-md-3 col-lg-3 col-xl-3">
            <div class="card shadow-lg border-0">

                <div class="card-header">
                    <div class="d-flex justify-content-end">
                        <div>
                            <button class="btn-modern btn-sm" title="${title}"
                                onclick="toggleActiveAssistido(${item.id})">
                                <i class="bi ${iconActive}"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Editar"
                                data-assistido='${JSON.stringify(item)}'
                                onclick="abrirModalEditarAssistido(this)">
                                <i class="bi bi-pencil-square"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Responsáveis"
                                onclick="abrirModalResponsavel(${item.id})">
                                <i class="bi bi-people"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Detalhes"
                                data-detalhes='${JSON.stringify(item)}'
                                onclick="abrirModalDetalhesAssistido(this)">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-body d-flex flex-column">
                    ${badgeActive}
                    <div class="fw-semibold fs-5">${item.nome}</div>
                    <div class="mb-3 small">
                        <i class="${icon} ${badge}">${text}</i>
                    </div>
                    <div class="mb-3 small">
                        <i class="bi bi-calendar text-muted"></i> <small class="text-muted fw-bold">${maskData(item.nascimento)}</small>
                    </div>
                    <div class="mb-3 small">
                        <i class="bi bi-telephone text-muted"></i> 
                        <small class="text-muted fw-bold">${item.telefone} 
                            <a href="https://wa.me/55${telefoneLimpo}" target="_blank" class="text-success text-decoration-none">
                                <i class="bi bi-whatsapp btn-modern btn-sm"></i>
                            </a>
                        </small>
                    </div>
                    <div class="mt-auto mb-2">
                    <small class="text-body fw-bold">
                        <small class="text-muted">
                        <i class="bi bi-pin-map"></i>
                            ${item.endereco}, ${item.numero}, ${item.bairro}
                            ${item.cep} - ${item.cidade}-${item.estado} ${item.complemento ? ', ' + item.complemento : ''}
                        </small>
                        <a href="${mapsUrl}" target="_blank" class="text-decoration-none">
                            <i class="bi bi-geo-alt-fill btn-modern btn-sm"></i>
                        </a>
                    </small>
                    </div>

                </div>
                <div class="card-footer h-100">
                    <small class="text-muted">
                        ${item.observacoes || "Sem observações"}
                    </small>
                </div>

            </div>
        </div>
        `
    });

    html += `</div>`
    container.innerHTML = html
}

function renderResponsaveis(items) {
    const responsaveisTableBody = document.getElementById("responsaveisTableBody");
    responsaveisTableBody.innerHTML = "";

    if (items.results.length === 0) {
        responsaveisTableBody.innerHTML = `
        <tr>
            <td colspan="3" class="text-center">Nenhum responsável encontrado.</td>
        </tr>
        `;
        return;
    }

    items.results.forEach(item => {
        const telefoneLimpo = item.telefone.replace(/\D/g, "");

        responsaveisTableBody.innerHTML += `
        <tr class="text-center">
            <td>${item.nome}</td>
            <td>${item.cpf || "-"}</td>
            <td>
                ${item.telefone}
                <a href="https://wa.me/55${telefoneLimpo}" target="_blank" class="text-success text-decoration-none">
                    <i class="bi bi-whatsapp btn-modern"></i> 
                </a>
            </td>
            <td>
                <a href="#" title="Editar Responsável" 
                    class="text-decoration-none"
                    data-responsavel='${JSON.stringify(item)}'
                    onclick="abrirModalEditarResponsavel(this)">
                    <i class="bi bi-pencil-square btn-modern"></i>
                </a>
                <a href="#" title="Excluir Responsável" 
                    class="text-decoration-none"
                    onclick="abrirModalExcluirResponsavel(${item.id})">
                    <i class="bi bi-trash btn-modern"></i>
                </a>
            </td>
        </tr>
        `;
    });
}

// ############################################
// ############################################


// ############################################
// ############## MODALS ######################
// ############################################

function abrirModalNovoAssistido() {
    document.getElementById("assistidoId").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("nascimento").value = "";
    document.getElementById("sexo").value = "";
    document.getElementById("cep").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("numero").value = "";
    document.getElementById("complemento").value = "";
    document.getElementById("bairro").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("estado").value = "";
    document.getElementById("observacoes").value = "";
    novoAssistidoModal.show();
}

async function abrirModalDetalhesAssistido(btn) {
    let item = JSON.parse(btn.dataset.detalhes);
    let sexo;
    if (item.sexo == "M") {
        sexo = "Masculino";
    } else if (item.sexo == "F") {
        sexo = "Feminino";
    } else {
        sexo = item.sexo;
    }

    document.getElementById("detalhe_nome").value = item.nome;
    document.getElementById("detalhe_telefone").value = item.telefone;
    document.getElementById("detalhe_nascimento").value = maskData(item.nascimento);
    document.getElementById("detalhe_sexo").value = sexo;
    document.getElementById("detalhe_cep").value = item.cep;
    document.getElementById("detalhe_endereco").value = item.endereco;
    document.getElementById("detalhe_numero").value = item.numero;
    document.getElementById("detalhe_complemento").value = item.complemento;
    document.getElementById("detalhe_bairro").value = item.bairro;
    document.getElementById("detalhe_cidade").value = item.cidade;
    document.getElementById("detalhe_estado").value = item.estado;
    document.getElementById("detalhe_observacoes").value = item.observacoes;
    detalhesAssistidoModal.show();
}

async function abrirModalEditarAssistido(btn) {
    let item = JSON.parse(btn.getAttribute("data-assistido"));
    document.getElementById("assistidoId").value = item.id;
    document.getElementById("nome").value = item.nome;
    document.getElementById("telefone").value = item.telefone;
    document.getElementById("nascimento").value = item.nascimento;
    document.getElementById("sexo").value = item.sexo;
    document.getElementById("cep").value = item.cep;
    document.getElementById("endereco").value = item.endereco;
    document.getElementById("numero").value = item.numero;
    document.getElementById("complemento").value = item.complemento;
    document.getElementById("bairro").value = item.bairro;
    document.getElementById("cidade").value = item.cidade;
    document.getElementById("estado").value = item.estado;
    document.getElementById("observacoes").value = item.observacoes;
    novoAssistidoModal.show();
}

async function abrirModalExcluirAssistido(id) {
    document.getElementById("deletarAssistidoId").value = id;
    deletarAssistidoModal.show();
}

async function abrirModalResponsavel(id) {

    document.getElementById("assistidoIdModal").value = id;
    await getData(
        url = `/api/responsaveis/?assistido=${id}`,
        renderFunction = renderResponsaveis
    );
    responsavelModal.show();
}

function abrirModalNovoResponsavel() {
    let id = document.getElementById("assistidoIdModal").value;
    document.getElementById("assistidoId").value = id;
    document.getElementById("responsavelId").value = "";
    document.getElementById("novo_responsavel_nome").value = "";
    document.getElementById("novo_responsavel_telefone").value = "";
    document.getElementById("novo_responsavel_cpf").value = "";
    novoResponsavelModal.show();
}

function abrirModalEditarResponsavel(btn) {
    let item = JSON.parse(btn.getAttribute("data-responsavel"));
    document.getElementById("responsavelId").value = item.id;
    document.getElementById("assistidoId").value = item.assistido;
    document.getElementById("novo_responsavel_nome").value = item.nome;
    document.getElementById("novo_responsavel_telefone").value = item.telefone;
    document.getElementById("novo_responsavel_cpf").value = item.cpf;
    novoResponsavelModal.show();
}

function abrirModalExcluirResponsavel(id) {
    document.getElementById("deletarResponsavelId").value = id;
    deletarResponsavelModal.show();
}

// ############################################
// ############################################


// ############################################
// ############## HELPERS #####################
// ############################################

async function salvarAssistido() {
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const nascimento = document.getElementById("nascimento").value;
    const sexo = document.getElementById("sexo").value;
    const cep = document.getElementById("cep").value;
    const endereco = document.getElementById("endereco").value;
    const numero = document.getElementById("numero").value;
    const complemento = document.getElementById("complemento").value;
    const bairro = document.getElementById("bairro").value;
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;
    const observacoes = document.getElementById("observacoes").value;
    let id = Number(document.getElementById("assistidoId").value);

    let url = "/api/assistidos/";
    let method = "POST";

    if (id) {
        id = parseInt(id);
        url = `/api/assistidos/${id}/`;
        method = "PATCH";
    }

    const item = {
        nome: nome,
        telefone: telefone,
        nascimento: nascimento,
        sexo: sexo,
        cep: cep,
        endereco: endereco,
        numero: numero,
        complemento: complemento,
        bairro: bairro,
        cidade: cidade,
        estado: estado,
        observacoes: observacoes
    };

    let res = await saveData(
        url = url,
        data = item,
        callBack = () => {
            loadAssistidos();
        },
        method = method
    );

    if (res) {
        novoAssistidoModal.hide();
        showToast("Assistido salvo com sucesso!", "success");
    }
}

async function toggleActiveAssistido(id) {
    let res = await patchData(
        `/api/assistidos/${id}/active/`,
        null,
        () => {
            loadAssistidos();
        }
    )

    if (res) {
        showToast("Assistido atualizado com sucesso!", "success");
    }
}

async function deletarAssistido() {
    const id = document.getElementById("deletarAssistidoId").value;
    let res = await deleteData(`/api/assistidos/${id}/`, loadAssistidos);
    if (res) {
        deletarAssistidoModal.hide();
        showToast("Assistido deletado com sucesso!", "success");
    }
}

async function salvarResponsavel() {
    const nome = document.getElementById("novo_responsavel_nome").value;
    const telefone = document.getElementById("novo_responsavel_telefone").value;
    const cpf = document.getElementById("novo_responsavel_cpf").value;
    const assistidoId = document.getElementById("assistidoId").value;
    let responsavelId = document.getElementById("responsavelId").value;

    let url = "/api/responsaveis/";
    let method = "POST";

    if (responsavelId) {
        responsavelId = parseInt(responsavelId);
        url = `/api/responsaveis/${responsavelId}/`;
        method = "PATCH";
    }

    const responsavel = {
        nome: nome,
        telefone: telefone,
        assistido: assistidoId,
        cpf: cpf
    };

    let res = await saveData(
        url = url,
        data = responsavel,
        callBack = () => getData(url = `/api/responsaveis/?assistido=${assistidoId}`, renderFunction = renderResponsaveis),
        method = method
    );

    if (res) {
        novoResponsavelModal.hide();
        showToast("Responsável salvo com sucesso!", "success");
    }
}

async function deletarResponsavel() {
    const id = document.getElementById("deletarResponsavelId").value;
    const assistidoId = document.getElementById("assistidoIdModal").value;
    let res = await deleteData(
        url = `/api/responsaveis/${id}/`,
        callBack = () => getData(url = `/api/responsaveis/?assistido=${assistidoId}`, renderFunction = renderResponsaveis)
    );
    deletarResponsavelModal.hide();
    showToast("Responsável deletado com sucesso!", "success");
}