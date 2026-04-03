let datasSelecionadas = new Set();
let calendar;
let isDraggingGlobal = false;
let modal_buscar_paciente;
let modal_buscar_cuidadora;
let modalEditarPlantao
let PLANTOES

// ###################################
// ########### LISTENERS #############
// ###################################

document.addEventListener("DOMContentLoaded", function () {
    modal_buscar_cuidadora = new bootstrap.Modal(document.getElementById('modal_buscar_cuidadora'));
    modal_buscar_paciente = new bootstrap.Modal(document.getElementById('modal_buscar_paciente'));
    modalEditarPlantao = new bootstrap.Modal(document.getElementById('modalEditarPlantao'));

    document.addEventListener("mousedown", () => {
        isDraggingGlobal = false;
    });

    document.addEventListener("mousemove", () => {
        isDraggingGlobal = true;
    });

    calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        selectable: true,
        selectMinDistance: 360,

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },

        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
        },

        dateClick: function (info) {
            if (!isDraggingGlobal) {
                toggleData(info.dateStr);
            }
        },

        select: function (info) {
            adicionarIntervalo(info.startStr, info.endStr);
            calendar.unselect();
        },

        dayCellDidMount: function (info) {
            atualizarVisualCelula(info.el, info.dateStr);
        },

        eventContent: function (arg) {
            const { horaInicio, horaFim, cuidadora } = arg.event.extendedProps;

            return {
                html: `
            <div class="fc-event-custom">
                <div class="fc-event-hora">${horaInicio} - ${horaFim}</div>
                <div class="fc-event-cuidadora">${cuidadora}</div>
            </div>
        `
            };
        },
        eventClick: function (info) {
            abrirModalEditarPlantao(info.event);
        }
    });

    calendar.render();
});

document.getElementById("btn-buscar-paciente").addEventListener("click", buscarPaciente)
document.getElementById("btn-buscar-cuidadora").addEventListener("click", buscarCuidadora)

// ###################################
// ########### PACIENTES #############
// ###################################

function openModalBuscarPaciente() {
    modal_buscar_paciente.show();
}

function buscarPaciente() {
    let filterField = document.getElementById("filter_paciente").value
    let filterValue = document.getElementById("filter_value_paciente").value.trim()
    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField)
        params.append("filter_value", filterValue)
    }

    getData(`/api/pacientes/?${params.toString()}`, (data) => {
        renderPacientes(data.results)
    })
}

function renderPacientes(pacientes = []) {
    let container = document.getElementById("pacientes_table")
    container.innerHTML = ""

    if (pacientes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                Nenhum paciente encontrado.
            </div>
        `
        return;
    }

    let html = ""

    pacientes.forEach(paciente => {
        html += `
            <tr class="text-center">
                <td>${paciente.nome}</td>
                <td>${paciente.idade}</td>
                <td>
                    <button class="btn btn-modern" onclick="selecionarPaciente(${paciente.id})">
                        Selecionar
                    </button>
                </td>
            </tr>
        `
    })

    container.innerHTML = html
}

function selecionarPaciente(id) {
    getData(`/api/pacientes/${id}/`, (data) => {
        document.getElementById("paciente").value = data.nome
        document.getElementById("paciente_id").value = data.id
        modal_buscar_paciente.hide()
        buscarPlantoes(id)
    })
}

// ###################################
// ########### CUIDADORES ############
// ###################################

function openModalBuscarCuidadora() {
    modal_buscar_cuidadora.show();
}

function buscarCuidadora() {
    let filterField = document.getElementById("filter_cuidadora").value
    let filterValue = document.getElementById("filter_value_cuidadora").value.trim()
    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField)
        params.append("filter_value", filterValue)
    }

    getData(`/api/cuidadoras/?${params.toString()}`, (data) => {
        renderCuidadoras(data.results)
    })
}

function renderCuidadoras(cuidadoras = []) {
    let container = document.getElementById("cuidadoras_table")
    container.innerHTML = ""

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
        const telefoneLimpo = cuidadora.telefone.replace(/\D/g, "");

        html += `
            <tr class="text-center">
                <td>${cuidadora.nome}</td>
                <td>${cuidadora.cpf}</td>
                <td>
                    ${cuidadora.telefone}
                    <a href="https://wa.me/55${telefoneLimpo}" target="_blank" class="text-success text-decoration-none">
                        <i class="bi bi-whatsapp btn-modern"></i>
                    </a>
                </td>
                <td>${cuidadora.nascimento.split("T")[0].split("-").reverse().join("/")}</td>
                <td>
                    <button class="btn btn-modern" onclick="selecionarCuidadora(${cuidadora.id}, '${cuidadora.nome}')">
                        Selecionar
                    </button>
                </td>
            </tr>
        `
    })

    container.innerHTML = html
}

function selecionarCuidadora(id, nome) {
    document.getElementById("cuidadora").value = nome
    document.getElementById("cuidadora_id").value = id
    document.getElementById("edit_cuidadora_nome").value = nome
    document.getElementById("edit_cuidadora").value = id
    modal_buscar_cuidadora.hide()
}

// ###################################
// ########### PLANTÕES ##############
// ###################################

function criarPlantoesLote() {
    const paciente = document.getElementById("paciente_id").value;
    const cuidadora = document.getElementById("cuidadora_id").value;
    const inicio = document.getElementById("hora_inicio").value;
    const fim = document.getElementById("hora_fim").value;

    if (!paciente || !cuidadora) {
        showToast("Selecione paciente e cuidadora", "danger");
        return;
    }

    if (datasSelecionadas.size === 0) {
        showToast("Selecione pelo menos um dia", "danger");
        return;
    }

    if (inicio === fim) {
        showToast("Hora início e fim não podem ser iguais", "danger");
        return;
    }

    const plantoes = Array.from(datasSelecionadas).map(data => {
        let dataFim = data;

        if (fim < inicio) {
            const d = new Date(data);
            d.setDate(d.getDate() + 1);
            dataFim = d.toISOString().split("T")[0];
        }

        return {
            inicio: `${data}T${inicio}:00`,
            fim: `${dataFim}T${fim}:00`,
            paciente: paciente,
            cuidadora: cuidadora,
        };
    });

    saveData("/api/plantao/lote/", { plantoes }, () => {
        showToast("Plantoes criados com sucesso", "success");
        datasSelecionadas.clear();
        atualizarCalendarioVisual();
        buscarPlantoes(paciente);
    });
}

function buscarPlantoes(paciente_id) {
    getData(`/api/plantao/?paciente=${paciente_id}`, (data) => {
        renderPlantoesNoCalendario(data)
        PLANTOES = data
    })
}

function renderPlantoesNoCalendario(plantoes = []) {
    calendar.removeAllEvents();

    const isMobile = window.innerWidth < 768;

    const eventos = plantoes.map(p => {
        const inicio = new Date(p.inicio);
        const fim = new Date(p.fim);

        const horaInicio = inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const horaFim = fim.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
            id: String(p.id),
            start: p.inicio,
            end: p.fim,
            allDay: false,

            title: isMobile
                ? `${horaInicio}-${horaFim}`
                : `${p.cuidadora_nome} (${horaInicio} - ${horaFim})`,

            backgroundColor: "#198754",
            borderColor: "#198754",

            extendedProps: {
                horaInicio,
                horaFim,
                cuidadora: p.cuidadora_nome,
                cuidadora_id: p.cuidadora,
            }
        };
    });

    calendar.setOption("eventContent", function (arg) {
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            return {
                html: `
                <div style="font-size:10px">
                    ${arg.event.extendedProps.horaInicio}-${arg.event.extendedProps.horaFim}
                </div>
            `
            };
        }

        let nome = arg.event.extendedProps.cuidadora.length > 15 ? arg.event.extendedProps.cuidadora.substring(0, 15) + "..." : arg.event.extendedProps.cuidadora;

        return {
            html: `
            <div>
                <strong>${nome}</strong><br>
                <small>${arg.event.extendedProps.horaInicio} - ${arg.event.extendedProps.horaFim}</small>
            </div>
        `
        };
    });

    calendar.addEventSource(eventos);
}

function abrirModalEditarPlantao(event) {
    const inicio = new Date(event.start);
    const fim = new Date(event.end);

    document.getElementById("edit_id").value = event.id;

    document.getElementById("edit_inicio").value =
        inicio.toTimeString().slice(0, 5);

    document.getElementById("edit_fim").value =
        fim.toTimeString().slice(0, 5);

    modalEditarPlantao.show();
}

function patchPlantao() {
    const id = document.getElementById("edit_id").value;
    const inicio = document.getElementById("edit_inicio").value;
    const fim = document.getElementById("edit_fim").value;
    const cuidadora = document.getElementById("edit_cuidadora").value;

    const event = calendar.getEventById(id);

    let dataInicio = event.startStr.split("T")[0];
    let dataFim = event.endStr.split("T")[0];

    if (fim < inicio) {
        const d = new Date(dataInicio);
        d.setDate(d.getDate() + 1);
        dataFim = d.toISOString().split("T")[0];
    } else {
        dataFim = dataInicio;
    }

    const payload = {
        inicio: `${dataInicio}T${inicio}:00`,
        fim: `${dataFim}T${fim}:00`,
        cuidadora: cuidadora
    };

    saveData(`/api/plantao/${id}/`, payload, () => {
        showToast("Atualizado com sucesso", "success");
        modalEditarPlantao.hide();

        buscarPlantoes(document.getElementById("paciente_id").value);

        event.setStart(payload.inicio);
        event.setEnd(payload.fim);

        const inicioDate = new Date(payload.inicio);
        const fimDate = new Date(payload.fim);

        event.setExtendedProp(
            "horaInicio",
            inicioDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );

        event.setExtendedProp(
            "horaFim",
            fimDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );

        event.setExtendedProp(
            "cuidadora",
            document.getElementById("edit_cuidadora_nome").value
        );
    }, "PATCH");

}

function deletarPlantao() {
    const id = document.getElementById("edit_id").value;

    deleteData(`/api/plantao/${id}/`, () => {
        showToast("Removido", "success");

        calendar.getEventById(id).remove();
        modalEditarPlantao.hide();
    });
}

// ###################################
// ########### CALENDARIO ############
// ###################################

function toggleData(data) {
    if (datasSelecionadas.has(data)) {
        datasSelecionadas.delete(data);
    } else {
        datasSelecionadas.add(data);
    }

    atualizarCalendarioVisual();
}

function adicionarIntervalo(start, end) {
    let atual = new Date(start);
    let fim = new Date(end);

    while (atual < fim) {
        let dataStr = atual.toISOString().split("T")[0];
        datasSelecionadas.add(dataStr);
        atual.setDate(atual.getDate() + 1);
    }

    atualizarCalendarioVisual();
}

function atualizarVisualCelula(el, data) {
    if (datasSelecionadas.has(data)) {
        el.classList.add("dia-selecionado");
    } else {
        el.classList.remove("dia-selecionado");
    }
}

function atualizarCalendarioVisual() {
    document.querySelectorAll('.fc-daygrid-day').forEach(el => {
        const data = el.getAttribute('data-date');
        atualizarVisualCelula(el, data);
    });
}

function exportarEscalaProfissional(plantoes) {
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF("landscape", "mm", "a4");

    const pacienteNome = document.getElementById("paciente").value || "Paciente";

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const mapa = {};
    plantoes.forEach(p => {
        const data = new Date(p.inicio).toISOString().split("T")[0];

        if (!mapa[data]) mapa[data] = [];

        const inicio = new Date(p.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const fim = new Date(p.fim).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        mapa[data].push({
            hora: `${inicio}-${fim}`,
            nome: p.cuidadora_nome
        });
    });

    const startX = 10;
    const startY = 45;
    const cellWidth = 40;
    const cellHeight = 25;

    pdf.setFontSize(16);
    pdf.setTextColor(33, 37, 41);
    pdf.text("ESCALA DE PLANTÕES", 148, 15, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(
        hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        148,
        21,
        { align: "center" }
    );

    pdf.setTextColor(0);
    pdf.setFontSize(11);
    pdf.text(`Paciente: ${pacienteNome}`, 10, 28);

    pdf.setDrawColor(200);
    pdf.line(10, 32, 287, 32);

    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    diasSemana.forEach((d, i) => {
        const x = startX + i * cellWidth;

        pdf.setFillColor(240, 240, 240);
        pdf.rect(x, startY - 8, cellWidth, 8, "F");

        pdf.setFontSize(9);
        pdf.setTextColor(80);
        pdf.text(d, x + cellWidth / 2, startY - 3, { align: "center" });
    });

    let diaAtual = 1;
    let linha = 0;

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            const x = startX + j * cellWidth;
            const y = startY + linha * cellHeight;

            pdf.setDrawColor(220);
            pdf.rect(x, y, cellWidth, cellHeight);

            if (i === 0 && j < diaSemanaInicio) continue;
            if (diaAtual > diasNoMes) continue;

            const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(diaAtual).padStart(2, "0")}`;

            pdf.setFontSize(9);
            pdf.setTextColor(0);
            pdf.text(String(diaAtual), x + cellWidth - 5, y + 5);
            let eventos = mapa[dataStr] || [];
            let offsetY = 8;

            eventos.forEach(ev => {
                if (offsetY < cellHeight - 5) {
                    pdf.setFontSize(7);
                    pdf.setTextColor(25, 135, 84);
                    pdf.text(ev.hora, x + 2, y + offsetY);

                    offsetY += 3;

                    pdf.setFontSize(6);
                    pdf.setTextColor(60);
                    let nome = ev.nome.length > 24 ? ev.nome.substring(0, 24) + "..." : ev.nome;
                    pdf.text(nome, x + 2, y + offsetY);

                    offsetY += 4;
                }
            });

            diaAtual++;
        }
        linha++;
    }

    pdf.save(`escala_${pacienteNome}.pdf`);
}
