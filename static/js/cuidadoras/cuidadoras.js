// ############################################
// ############## LISTENNERS ##################
// ############################################
let novaCuidadoraModal;

document.addEventListener("DOMContentLoaded", () => {
    loadCuidadoras();
    novaCuidadoraModal = new bootstrap.Modal(document.getElementById('novaCuidadoraModal'));
});

document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault()
    loadCuidadoras()
})

document.getElementById("novaCuidadoraBtn").addEventListener("click", () => {
    abrirModalNovaCuidadora();
});

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

function loadCuidadoras(url = null) {
    const search = document.querySelector('input[name="search"]').value || ""

    if (!url) {
        url = `/api/cuidadoras/?search=${encodeURIComponent(search)}`
    }

    getData(url, (data) => {
        renderCuidadoras(data.results)

        renderPaginationDRF({
            next: data.next,
            previous: data.previous
        })
    })
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
        html += `
        <tr class="text-center">
            <td>${cuidadora.nome}</td>
            <td>${cuidadora.cpf}</td>
            <td>${cuidadora.telefone}</td>
            <td>
                <button class="btn-modern" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn-modern" title="Detalhes">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn-modern" title="Excluir">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
        `
    })

    container.innerHTML = html
}

// ############################################
// ############################################


// ############################################
// ############## MODALS ######################
// ############################################

function abrirModalNovaCuidadora() {
    document.getElementById("novaCuidadoraForm").reset();
    novaCuidadoraModal.show();
}

// ############################################
// ############################################