let editarPlantaoModal;


function getMaps(endereco) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(mapsUrl, '_blank');
}

document.addEventListener("DOMContentLoaded", async () => {
    editarPlantaoModal = new bootstrap.Modal(document.getElementById('editarPlantaoModal'));
    loadPlantoes();
})

document.getElementById("andamento-tab").addEventListener("click", loadPlantoes);
document.getElementById("finalizados-tab").addEventListener("click", loadPlantoes);
document.getElementById("expirados-tab").addEventListener("click", loadPlantoes);
document.getElementById("btn-editar-plantao").addEventListener("click", savePlantaoEdit);

document.getElementById("filter_btn").addEventListener("click", loadPlantoes);
document.getElementById("clear_filter_btn").addEventListener("click", () => {
    document.getElementById("filter_type").value = "username";
    document.getElementById("filter_value").value = "";
    document.getElementById("data_inicio").value = "";
    document.getElementById("data_fim").value = "";
    loadPlantoes();
})

function formatDateTime(date) {
    return new Date(date).toLocaleTimeString("pt-BR").slice(0, 5) + " - " + new Date(date).toLocaleDateString("pt-BR")
}

function loadPlantoes() {
    let filterField = document.getElementById("filter_type").value;
    let filterValue = document.getElementById("filter_value").value.trim();
    let dataInicio = document.getElementById("data_inicio").value;
    let dataFim = document.getElementById("data_fim").value;
    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField);
        params.append("filter_value", filterValue);
    }

    if (dataInicio) {
        params.append("data_inicio", dataInicio);
    }

    if (dataFim) {
        params.append("data_fim", dataFim);
    }

    getData(`/api/plantao/?${params.toString()}`, (data) => {
        renderPlantoes(data)
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
        let badgeColor = ""

        if (plantao.status == 'P') bgcolor = "bg-warning-subtle"
        else if (plantao.status == 'A' || plantao.status == 'C') bgcolor = "bg-secondary-subtle"
        else if (plantao.status == 'R') bgcolor = "bg-primary-subtle"
        else if (plantao.status == 'F') bgcolor = "bg-success-subtle"
        else if (plantao.status == 'E' || plantao.status == 'D') bgcolor = "bg-danger-subtle"

        if (plantao.status == 'P') badgeColor = "bg-warning"
        else if (plantao.status == 'A' || plantao.status == 'C') badgeColor = "bg-secondary"
        else if (plantao.status == 'R') badgeColor = "bg-primary"
        else if (plantao.status == 'F') badgeColor = "bg-success"
        else if (plantao.status == 'E' || plantao.status == 'D') badgeColor = "bg-danger"

        const cumpridas = floatToHHMM(plantao.horas_cumpridas)
        const enderecoCompleto = `${plantao.paciente_detalhe.endereco}, ${plantao.paciente_detalhe.numero}, ${plantao.paciente_detalhe.complemento}, ${plantao.paciente_detalhe.bairro}, ${plantao.paciente_detalhe.cidade}-${plantao.paciente_detalhe.estado}, ${plantao.paciente_detalhe.cep}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;

        let horarioColor = plantao.horas_cumpridas < plantao.horas
            ? "bg-warning-subtle"
            : "bg-success-subtle"

        let textColor = plantao.horas_cumpridas < plantao.horas
            ? "text-danger"
            : "text-info-emphasis"

        const card = `
                <div class="col-12 col-md-6 col-lg-4 col-xl-4 mb-4">
                    <div class="card plantao-card shadow-lg">
                        <div class="card-header d-flex justify-content-between">
                            <div>
                                <button class="btn-modern btn-sm"
                                    data-plantao='${JSON.stringify(plantao)}'
                                    onclick="openEditPlantaoModal(this)"
                                    >
                                    <i class="bi bi-gear"></i> Editar
                                </button>
                            </div>
                            <div>
                                <span class="badge text-center gap-1 ${badgeColor}">
                                    ${plantao.status_name}
                                </span>
                            </div>

                        </div>

                        <div class="card-body d-flex flex-column">
                            <div class="mb-3 small text-center">
                                Carga Horária
                                <span class="badge bg-info-subtle text-info-emphasis">
                                    ⏱ ${plantao.horas}h
                                </span>
                                <br>
                                Cumpridas
                                <span class="badge ${horarioColor} ${textColor}">
                                    ⏱ ${cumpridas}h
                                </span>
                            </div>

                            <div class="text-truncate text-center">
                                <div class="fw-semibold">
                                    <small class="text-body-secondary">Paciente:</small>
                                    ${plantao.paciente_nome}
                                </div>
                            </div>

                            <div class="text-truncate text-center">
                                <div class="fw-semibold">
                                    <small class="text-body-secondary">Cuidador(a):</small>
                                    ${plantao.cuidadora_nome}
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-center mb-2">
                                <a href="/registro/${plantao.id}" target="_blank" class="btn-modern">
                                    Registro
                                </a>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-2">
                                <div class="avatar-icon me-2">
                                    <a href="${mapsUrl}" target="_blank" class="text-decoration-none">
                                        <i class="bi bi-geo-alt btn-modern btn-sm m-2"></i>
                                    </a>
                                </div>
                                <small class="text-body-secondary">
                                    ${plantao.paciente_detalhe.endereco}, ${plantao.paciente_detalhe.numero}, ${plantao.paciente_detalhe.bairro} - ${plantao.paciente_detalhe.cidade}-${plantao.paciente_detalhe.estado}
                                </small>
                            </div>
                        </div>

                        <div class="card-footer">
                            <div class="d-flex justify-content-center gap-1">
                                <small>
                                    <span class="badge bg-dark rounded-pill">
                                        ${formatDateTime(plantao.inicio)}
                                    </span>
                                    <span class="badge bg-dark rounded-pill">
                                        <i class="bi bi-arrow-right-short"></i>
                                    </span>
                                    <span class="badge bg-dark rounded-pill">
                                        ${formatDateTime(plantao.fim)}
                                    </span>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `

        if (['A', 'C', 'P', 'R'].includes(plantao.status)) {
            htmlAndamento += card
        } else if (plantao.status == 'F') {
            htmlFinalizados += card
        } else if (plantao.status == 'E' || plantao.status == 'D') {
            htmlExpirados += card
        }
    })

    divAndamento.innerHTML = htmlAndamento
    divFinalizados.innerHTML = htmlFinalizados
    divExpirados.innerHTML = htmlExpirados
}

function openEditPlantaoModal(btn) {
    const plantao = JSON.parse(btn.dataset.plantao);
    document.getElementById("editar-plantao-id").value = plantao.id;
    document.getElementById("editar-plantao-nome").innerText = plantao.paciente_nome;
    editarPlantaoModal.show();
}

function savePlantaoEdit() {
    const id = document.getElementById("editar-plantao-id").value;
    const status = document.getElementById("editar-plantao-status").value;
    const horas_cumpridas = document.getElementById("editar-plantao-horas-cumpridas").value;

    const data = {
        id: id,
        status: status,
        horas_cumpridas: horas_cumpridas
    }

    patchData(`/api/plantao/${id}/`, data, () => {
        editarPlantaoModal.hide();
        loadPlantoes();
    });
}