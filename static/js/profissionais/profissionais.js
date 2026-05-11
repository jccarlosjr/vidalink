// ############################################
// ############## LISTENNERS ##################
// ############################################
let novoProfissionalModal;
let deletarProfissionalModal;
let detalhesProfissionalModal;
let plantoesProfissionalModal;
let resetSenhaModal;

document.addEventListener("DOMContentLoaded", () => {
    loadProfissionais();
    novoProfissionalModal = new bootstrap.Modal(document.getElementById('novoProfissionalModal'));
    deletarProfissionalModal = new bootstrap.Modal(document.getElementById('deletarProfissionalModal'));
    detalhesProfissionalModal = new bootstrap.Modal(document.getElementById('detalhesProfissionalModal'));
    plantoesProfissionalModal = new bootstrap.Modal(document.getElementById('plantoesProfissionalModal'));
    resetSenhaModal = new bootstrap.Modal(document.getElementById('resetSenhaModal'));
});

document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault()
    loadProfissionais()
})

document.getElementById("novoProfissionalBtn").addEventListener("click", () => {
    abrirModalNovoProfissional();
});

document.getElementById("saveNovoProfissionalBtn").addEventListener("click", saveProfissional);
document.getElementById("filter_btn").addEventListener("click", () => loadProfissionais());
document.getElementById("clear_filter_btn").addEventListener("click", clearFilter);
document.getElementById("btn-reset-password").addEventListener("click", resetSenhaUsuario);


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

function formatDate(date) {
    return new Date(date).toLocaleDateString("pt-BR")
}

function formatDateTime(date) {
    return new Date(date).toLocaleDateString("pt-BR") + " " + new Date(date).toLocaleTimeString("pt-BR")
}

function clearFilter() {
    document.getElementById("filter_type").value = ""
    document.getElementById("filter_value").value = ""
    loadProfissionais()
}

function loadProfissionais(url = null) {
    let filterField = document.getElementById("filter_type").value
    let filterValue = document.getElementById("filter_value").value.trim()
    let checked = document.getElementById("filter_active").checked;

    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField);
        params.append("filter_value", filterValue);
    } else if (checked) {
        params.append("is_active", true);
    }

    const endpoint = url || `/api/profissionais/?${params.toString()}`

    getData(endpoint, (data) => {
        renderProfissionais(data.results)

        renderPaginationDRF({
            next: data.next,
            previous: data.previous
        })
    })
}

async function saveProfissional() {
    let id_profissional = document.getElementById("id_profissional").value
    let nome = document.getElementById("nome").value
    let cpf = document.getElementById("cpf").value
    let nascimento = document.getElementById("nascimento").value
    let cnpj = document.getElementById("cnpj").value
    let telefone = document.getElementById("telefone").value
    let cep = document.getElementById("cep").value
    let endereco = document.getElementById("endereco").value
    let numero = document.getElementById("numero").value
    let complemento = document.getElementById("complemento").value
    let bairro = document.getElementById("bairro").value
    let cidade = document.getElementById("cidade").value
    let estado = document.getElementById("estado").value
    let codigo_banco = document.getElementById("codigo_banco").value
    let agencia_conta = document.getElementById("agencia_conta").value
    let numero_conta = document.getElementById("numero_conta").value
    let tipo_conta = document.getElementById("tipo_conta").value
    let chave_pix = document.getElementById("chave_pix").value
    let tipo_chave_pix = document.getElementById("tipo_chave_pix").value
    let ativoBool = document.getElementById("ativo").checked;


    let payload = {
        "id_profissional": id_profissional,
        "nome": nome,
        "cpf": cpf,
        "nascimento": nascimento,
        "cnpj": cnpj,
        "telefone": telefone,
        "cep": cep,
        "endereco": endereco,
        "numero": numero,
        "complemento": complemento,
        "bairro": bairro,
        "cidade": cidade,
        "estado": estado,
        "codigo_banco": codigo_banco,
        "agencia_conta": agencia_conta,
        "numero_conta": numero_conta,
        "tipo_conta": tipo_conta,
        "chave_pix": chave_pix,
        "tipo_chave_pix": tipo_chave_pix,
        "is_active": ativoBool
    }

    let url
    let method

    if (id_profissional) {
        url = `/api/profissionais/${id_profissional}/`
        method = "PATCH"
    } else {
        url = `/api/profissionais/`
        method = "POST"
    }

    let res = await saveData(
        url, payload,
        () => {
            novoProfissionalModal.hide();
            loadProfissionais();
        },
        method
    )

    if (res) {
        novoProfissionalModal.hide();
        showToast("Profissional salvo com sucesso!", "success");
    }
}

async function getPlantoes(profissional_id) {
    getData(`/api/plantao/?profissional=${profissional_id}`, (data) => {
        renderPlantoes(data)
        plantoesProfissionalModal.show();
    })

    getData(`/api/plantao/plantoes_finalizados_by_user/?profissional=${profissional_id}`, (data) => {
        if (data.horas_cumpridas_total < data.horas_devidas) {
            document.getElementById("horas_cumpridas").classList.add("text-danger")
        }

        document.getElementById("total_plantoes").value = data.total_plantoes
        document.getElementById("horas_devidas").value = `${data.horas_devidas}h`
        document.getElementById("horas_cumpridas").value = `${data.horas_cumpridas_total}h`
        document.getElementById("plantoes_finalizados").value = data.plantoes_finalizados
        document.getElementById("plantoes_expirados").value = data.plantoes_expirados
        document.getElementById("plantoes_expirados").classList.add("text-danger")
    })
}



async function toggleActiveProfissional(id_profissional) {
    let res = await patchData(
        `/api/profissionais/${id_profissional}/active/`,
        null,
        () => {
            loadProfissionais();
        }
    )

    if (res) {
        showToast("Profissional atualizado com sucesso!", "success");
    }
}

function resetSenhaUsuario() {
    const userId = document.getElementById('reset-user-id').value
    const password = document.getElementById('reset-password').value
    const confirm = document.getElementById('reset-password-confirm').value

    if (!password || !confirm) {
        showToast('Informe a nova senha e a confirmação')
        return
    }

    if (password !== confirm) {
        showToast('As senhas não coincidem')
        return
    }

    fetch(`/api/profissionais/${userId}/reset-password/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            password: password
        })
    })
        .then(async r => {
            const data = await r.json()

            if (!r.ok) {
                throw new Error(data.detail || 'Erro ao redefinir senha')
            }

            return data
        })
        .then(data => {
            resetSenhaModal.hide()
            showToast(data.detail || 'Senha redefinida com sucesso', 'success')
        })
        .catch(err => showToast(err.message))
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
            onclick="loadProfissionais('${pagination.previous}')">
            ← Anterior
        </button>
    `

    html += `
        <button class="btn-modern"
            ${!pagination.next ? "disabled" : ""}
            onclick="loadProfissionais('${pagination.next}')">
            Próxima →
        </button>
    `

    html += `</div>`

    container.innerHTML = html
}

function renderProfissionais(profissionais) {
    let container = document.getElementById("table-profissionais")

    if (profissionais.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                Nenhuma profissional encontrada.
            </div>
        `
        return;
    }

    let html = ""

    profissionais.forEach(profissional => {
        const enderecoCompleto = `${profissional.endereco}, ${profissional.numero}, ${profissional.complemento}, ${profissional.bairro}, ${profissional.cidade}-${profissional.estado}, ${profissional.cep}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
        const telefoneLimpo = profissional.telefone?.replace(/\D/g, "") || ""

        const ativa = profissional.is_active
        let icon
        let title

        if (ativa) {
            icon = "bi-check-circle text-success"
            title = "Ativa"
        } else {
            icon = "bi-x-circle text-danger"
            title = "Inativa"
        }

        let badgeAtiva = ""

        if (ativa) {
            badgeAtiva = ""
        } else {
            badgeAtiva = "<span class='badge bg-danger'>Profissional Inativo(a)</span>"
        }

        let isAdmin = ""
        if (profissional.is_staff || profissional.is_superuser) {
            isAdmin = "<span class='badge rounded-pill bg-success' title='Membro da Equipe Administradora'><i class='bi bi-person-workspace'></i></span>"
        }

        html += `
        <div class="col-12 col-md-3 col-lg-3 col-xl-3">
            <div class="card shadow-lg border-0">
                <div class="card-header">
                    <div class="d-flex justify-content-between">
                        <div>
                        </div>

                        <div>
                            <button class="btn-modern btn-sm" title="${title}" onclick="toggleActiveProfissional(${profissional.id})">
                                <i class="bi ${icon}"></i>
                            </button>
                            <button class="btn-modern btn-sm" title="Resetar senha"
                                onclick="openResetPasswordModal(${profissional.id}, '${profissional.username}')">
                                <i class="bi bi-key"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Editar"
                                data-profissional='${JSON.stringify(profissional)}'
                                onclick="abrirModalEditarProfissional(this)"
                            >
                                <i class="bi bi-pencil-square"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Escalas e Plantões"
                                onclick="getPlantoes(${profissional.id})">
                                <i class="bi bi-calendar"></i>
                            </button>

                            <button class="btn-modern btn-sm" title="Detalhes"
                                data-profissional='${JSON.stringify(profissional)}'
                                onclick="abrirModalDetalheProfissional(this)">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-body d-flex flex-column text-center">
                    ${badgeAtiva}
                    <small class="fw-semibold text-light badge rounded-pill bg-dark">
                        ${profissional.username}
                        ${isAdmin}
                    </small>
                    <div class="fw-semibold fs-5">${profissional.nome || ''}</div>
                    <div class="mb-3 small text-muted">
                        ${profissional.cpf || ''}
                    </div>
                    <div class="mb-3 small">
                        ${profissional.telefone || ''}
                        <a href="https://wa.me/55${telefoneLimpo}" target="_blank" class="text-success text-decoration-none">
                            <i class="bi bi-whatsapp btn-modern btn-sm"></i>
                        </a>
                    </div>

                </div>
            </div>
        </div>
        `
    })

    container.innerHTML = html
}

function renderPlantoes(plantoes) {
    let divAndamento = document.getElementById("plantoes-andamento")
    let divFinalizados = document.getElementById("plantoes-finalizados")
    let divExpirados = document.getElementById("plantoes-expirados")

    function floatToHHMM(value) {
        const hours = Math.floor(value)
        const minutes = Math.round((value - hours) * 60)

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }

    let htmlAndamento = ""
    let htmlFinalizados = ""
    let htmlExpirados = ""

    plantoes.forEach(plantao => {
        let bgcolor = ""

        if (plantao.status == 'P') bgcolor = "bg-warning"
        else if (plantao.status == 'A' || plantao.status == 'C') bgcolor = "bg-secondary"
        else if (plantao.status == 'R') bgcolor = "bg-primary"
        else if (plantao.status == 'F') bgcolor = "bg-success"
        else if (plantao.status == 'E') bgcolor = "bg-danger"

        const cumpridas = floatToHHMM(plantao.horas_cumpridas)

        let horarioColor = plantao.horas_cumpridas < plantao.horas
            ? "bg-warning-subtle"
            : "bg-success-subtle"

        let textColor = plantao.horas_cumpridas < plantao.horas
            ? "text-danger"
            : "text-info-emphasis"

        const card = `
            <div class="col-12 col-md-6 col-lg-4 col-xl-4 mb-4">
                <div class="card h-100 plantao-card">
                    <div class="card-body d-flex flex-column">

                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge plantao-badge">
                                ${plantao.codigo_interno || 'Sem código'}
                            </span>
                            <span class="badge d-flex align-items-center gap-1 ${bgcolor}">
                                ${plantao.status_name}
                            </span>
                        </div>

                        <div class="mb-3 small text-body-secondary">
                            <i class="bi bi-calendar-event me-1"></i>
                            ${formatDateTime(plantao.inicio)}<br>
                            <span class="opacity-75">até</span><br>
                            <i class="bi bi-calendar-event me-1"></i>
                            ${formatDateTime(plantao.fim)}
                        </div>

                        <div class="mb-3 small">
                            Carga Horária
                            <span class="badge bg-info-subtle text-info-emphasis">
                                ⏱ ${plantao.horas}h
                            </span>
                            Cumpridas
                            <span class="badge ${horarioColor} ${textColor}">
                                ⏱ ${cumpridas}h
                            </span>
                        </div>

                        <div class="d-flex align-items-center mb-2">
                            <div class="avatar-icon me-2">
                                <i class="bi bi-person-heart"></i>
                            </div>
                            <div class="text-truncate">
                                <div class="fw-semibold">${plantao.assistido_nome}</div>
                                <small class="text-body-secondary">Assistido</small>
                            </div>
                        </div>

                        <div class="d-flex align-items-center">
                            <div class="avatar-icon me-2">
                                <i class="bi bi-person-badge"></i>
                            </div>
                            <div class="text-truncate">
                                <div class="fw-semibold">${plantao.profissional_nome}</div>
                                <small class="text-body-secondary">Profissional</small>
                            </div>
                        </div>

                        <div class="mt-auto"></div>
                    </div>
                </div>
            </div>
        `

        if (['A', 'C', 'P', 'R'].includes(plantao.status)) {
            htmlAndamento += card
        } else if (plantao.status == 'F') {
            htmlFinalizados += card
        } else if (plantao.status == 'E') {
            htmlExpirados += card
        }
    })

    divAndamento.innerHTML = htmlAndamento
    divFinalizados.innerHTML = htmlFinalizados
    divExpirados.innerHTML = htmlExpirados
}
// ############################################
// ############################################


// ############################################
// ############## MODALS ######################
// ############################################

function abrirModalNovoProfissional() {
    document.getElementById("id_profissional").value = ""
    document.getElementById("nome").value = ""
    document.getElementById("cpf").value = ""
    document.getElementById("nascimento").value = ""
    document.getElementById("cnpj").value = ""
    document.getElementById("telefone").value = ""
    document.getElementById("cep").value = ""
    document.getElementById("endereco").value = ""
    document.getElementById("numero").value = ""
    document.getElementById("complemento").value = ""
    document.getElementById("bairro").value = ""
    document.getElementById("cidade").value = ""
    document.getElementById("estado").value = ""
    document.getElementById("ativo").value = ""

    novoProfissionalModal.show();
}

function abrirModalEditarProfissional(btn) {
    let profissional = JSON.parse(btn.dataset.profissional)
    document.getElementById("id_profissional").value = profissional.id
    document.getElementById("nome").value = profissional.nome
    document.getElementById("cpf").value = profissional.cpf
    document.getElementById("nascimento").value = profissional.nascimento
    document.getElementById("cnpj").value = profissional.cnpj
    document.getElementById("telefone").value = profissional.telefone
    document.getElementById("cep").value = profissional.cep
    document.getElementById("endereco").value = profissional.endereco
    document.getElementById("numero").value = profissional.numero
    document.getElementById("complemento").value = profissional.complemento
    document.getElementById("bairro").value = profissional.bairro
    document.getElementById("cidade").value = profissional.cidade
    document.getElementById("estado").value = profissional.estado
    document.getElementById("ativo").value = profissional.is_active
    document.getElementById("codigo_banco").value = profissional.codigo_banco
    document.getElementById("agencia_conta").value = profissional.agencia_conta
    document.getElementById("numero_conta").value = profissional.numero_conta
    document.getElementById("tipo_conta").value = profissional.tipo_conta
    document.getElementById("chave_pix").value = profissional.chave_pix
    document.getElementById("tipo_chave_pix").value = profissional.tipo_chave_pix

    novoProfissionalModal.show();
}

function abrirModalDetalheProfissional(btn) {
    let profissional = JSON.parse(btn.dataset.profissional)
    document.getElementById("detalhe_nome").value = profissional.nome
    document.getElementById("detalhe_cpf").value = profissional.cpf
    document.getElementById("detalhe_nascimento").value = profissional.nascimento
    document.getElementById("detalhe_cnpj").value = profissional.cnpj
    document.getElementById("detalhe_telefone").value = profissional.telefone
    document.getElementById("detalhe_cep").value = profissional.cep
    document.getElementById("detalhe_endereco").value = profissional.endereco
    document.getElementById("detalhe_numero").value = profissional.numero
    document.getElementById("detalhe_complemento").value = profissional.complemento
    document.getElementById("detalhe_bairro").value = profissional.bairro
    document.getElementById("detalhe_cidade").value = profissional.cidade
    document.getElementById("detalhe_estado").value = profissional.estado
    document.getElementById("detalhe_codigo_banco").value = profissional.codigo_banco
    document.getElementById("detalhe_agencia_conta").value = profissional.agencia_conta
    document.getElementById("detalhe_numero_conta").value = profissional.numero_conta
    document.getElementById("detalhe_tipo_conta").value = profissional.tipo_conta
    document.getElementById("detalhe_chave_pix").value = profissional.chave_pix
    document.getElementById("detalhe_tipo_chave_pix").value = profissional.tipo_chave_pix

    document.getElementById("detalhe_ativo").checked = profissional.is_active;

    detalhesProfissionalModal.show();
}

function openResetPasswordModal(userId, username) {
    document.getElementById('reset-user-id').value = userId
    document.getElementById('reset-user-name').innerText = username
    document.getElementById('reset-password').value = ''
    document.getElementById('reset-password-confirm').value = ''

    resetSenhaModal.show()
}
// ############################################
// ############################################

