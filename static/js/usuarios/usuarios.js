let plantoesCuidadoraModal, resetSenhaModal;

document.addEventListener("DOMContentLoaded", () => {
    plantoesCuidadoraModal = new bootstrap.Modal(document.getElementById('plantoesCuidadoraModal'));
    resetSenhaModal = new bootstrap.Modal(document.getElementById('resetSenhaModal'));
    loadUsuarios()
})

document.getElementById("filter_btn").addEventListener("click", loadUsuarios)
document.getElementById("clear_filter_btn").addEventListener("click", clearFilter)
document.getElementById("btn-reset-password").addEventListener("click", resetSenhaUsuario)


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


function clearFilter() {
    document.getElementById("filter_type").value = ""
    document.getElementById("filter_value").value = ""
    loadUsuarios()
}


function loadUsuarios() {
    let filterField = document.getElementById("filter_type").value
    let filterValue = document.getElementById("filter_value").value.trim()
    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField)
        params.append("filter_value", filterValue)
    }

    getData(`/api/users/?${params.toString()}`, (data) => {
        renderUsuarios(data.results)

        renderPaginationDRF({
            next: data.next,
            previous: data.previous
        })
    })
}


function renderUsuarios(usuarios) {
    const container = document.getElementById("table-usuarios");
    container.innerHTML = "";

    if (usuarios.length === 0) {
        container.innerHTML = "<p>Nenhum usuário encontrado.</p>";
        return;
    }

    usuarios.forEach((usuario) => {
        container.appendChild(createUsuariosCard(usuario));
    });
}


function createUsuariosCard(usuario) {
    const tr = document.createElement("tr");
    const telefoneLimpo = usuario.cuidadora.telefone.replace(/\D/g, "");
    tr.classList.add("small")

    tr.innerHTML = `
            <td>${usuario.username}</td>
            <td>${usuario.cuidadora.nome}</td>
            <td>${usuario.cuidadora.cpf || '-'}</td>
            <td>
            ${usuario.cuidadora.telefone || '-'}
            <a href="https://wa.me/55${telefoneLimpo}" target="_blank" class="text-success text-decoration-none">
                <i class="bi bi-whatsapp btn-modern btn-sm"></i>
            </a>
            </td>
            <td class="text-center">
                <div class="form-check form-switch d-inline-flex">
                    <input 
                        class="form-check-input" 
                        type="checkbox" ${usuario.is_active ? 'checked' : ''}
                        onclick="toggleActiveUsuario(${usuario.id})"
                        >
                </div>
            </td>
            <td>
                <a class="btn-modern btn-sm" onclick="getPlantoes(${usuario.cuidadora.id})">
                    <i class="bi bi bi-calendar2-check"></i>
                </a>
                <a class="btn-modern btn-sm">
                    <i class="bi bi-pencil-square"></i>
                </a>
                <a class="btn-modern btn-sm" onclick="openResetPasswordModal(${usuario.id}, '${usuario.username}')">
                    <i class="bi bi-key"></i>
                </a>
            </td>
        `;
    return tr;
}


function openResetPasswordModal(userId, username) {
    document.getElementById('reset-user-id').value = userId
    document.getElementById('reset-user-name').innerText = username
    document.getElementById('reset-password').value = ''
    document.getElementById('reset-password-confirm').value = ''

    resetSenhaModal.show()
}


function resetSenhaUsuario() {
    const userId = document.getElementById('reset-user-id').value
    const password = document.getElementById('reset-password').value
    const confirm = document.getElementById('reset-password-confirm').value

    if (password.length < 6 || confirm.length < 6) {
        showToast('A nova senha deve ter pelo menos 6 caracteres')
        return
    }

    if (!password || !confirm) {
        showToast('Informe a nova senha e a confirmação')
        return
    }

    if (password !== confirm) {
        showToast('As senhas não coincidem')
        return
    }



    fetch('/api/users/' + userId + '/reset-password/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            id: userId,
            password: password
        })
    })
        .then(async r => {
            const data = await r.json()
            if (!r.ok || data.status === 'error') {
                throw new Error(data.message)
            }
            return data
        })
        .then(() => {
            resetSenhaModal.hide()
            showToast('Senha redefinida com sucesso', 'success')
        })
        .catch(err => showToast(err.message))
}


async function toggleActiveUsuario(id_usuario) {
    let res = await patchData(
        `/api/users/${id_usuario}/active/`,
        null,
        () => {
            loadUsuarios();
        }
    )

    if (res) {
        showToast("Usuário atualizado com sucesso!", "success");
    }
}


// ############################################
// ############## PLANTOES ####################
// ############################################

async function getPlantoes(cuidadora_id) {
    getData(`/api/plantao/?cuidadora=${cuidadora_id}`, (data) => {
        renderPlantoes(data)
        plantoesCuidadoraModal.show();
    })
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
                                ${plantao.escala_codigo_interno || 'Sem código'}
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
                                <div class="fw-semibold">${plantao.paciente_nome}</div>
                                <small class="text-body-secondary">Paciente</small>
                            </div>
                        </div>

                        <div class="d-flex align-items-center">
                            <div class="avatar-icon me-2">
                                <i class="bi bi-person-badge"></i>
                            </div>
                            <div class="text-truncate">
                                <div class="fw-semibold">${plantao.cuidadora_nome}</div>
                                <small class="text-body-secondary">Cuidador(a)</small>
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
// ############## HELPERS #####################
// ############################################

function formatDate(date) {
    return new Date(date).toLocaleDateString("pt-BR")
}

function formatDateTime(date) {
    return new Date(date).toLocaleDateString("pt-BR") + " " + new Date(date).toLocaleTimeString("pt-BR")
}
