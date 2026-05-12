let datasSelecionadas = new Set();
let calendar;
let isDraggingGlobal = false;
let modal_buscar_assistido;
let modal_buscar_profissional;
let modalEditarPlantao
let PLANTOES

// ###################################
// ########### LISTENERS #############
// ###################################

document.addEventListener("DOMContentLoaded", function () {
    modal_buscar_profissional = new bootstrap.Modal(document.getElementById('modal_buscar_profissional'));
    modal_buscar_assistido = new bootstrap.Modal(document.getElementById('modal_buscar_assistido'));
    modalEditarPlantao = new bootstrap.Modal(document.getElementById('modalEditarPlantao'));
    buscarRegraPagamento();

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
            const { horaInicio, horaFim, profissional } = arg.event.extendedProps;

            return {
                html: `
                    <div class="fc-event-custom">
                        <div class="fc-event-hora">${horaInicio} - ${horaFim}</div>
                        <div class="fc-event-profissional">${profissional}</div>
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

document.getElementById("btn-buscar-assistido").addEventListener("click", buscarAssistido)
document.getElementById("btn-buscar-profissional").addEventListener("click", buscarProfissional)

// ###################################
// ########### ASSISTIDOS ##############
// ###################################

function openModalBuscarAssistido() {
    modal_buscar_assistido.show();
}

function buscarAssistido() {
    let filterField = document.getElementById("filter_assistido").value
    let filterValue = document.getElementById("filter_value_assistido").value.trim()
    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField)
        params.append("filter_value", filterValue)
    }

    getData(`/api/assistidos/?${params.toString()}`, (data) => {
        renderAssistidos(data.results)
    })
}

function renderAssistidos(assistidos = []) {
    let container = document.getElementById("assistidos_table")
    container.innerHTML = ""

    if (assistidos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                Nenhum assistido encontrado.
            </div>
        `
        return;
    }

    let html = ""

    assistidos.forEach(assistido => {
        html += `
            <tr class="text-center">
                <td>${assistido.nome}</td>
                <td>${maskData(assistido.nascimento)}</td>
                <td>
                    <button class="btn btn-modern" onclick="selecionarAssistido(${assistido.id})">
                        Selecionar
                    </button>
                </td>
            </tr>
        `
    })

    container.innerHTML = html
}

function selecionarAssistido(id) {
    getData(`/api/assistidos/${id}/`, (data) => {
        document.getElementById("assistido").value = data.nome
        document.getElementById("assistido_id").value = data.id
        modal_buscar_assistido.hide()
        buscarPlantoes(id)
    })
}

// ###################################
// ########### PROFISSIONAIS #########
// ###################################

function openModalBuscarProfissional() {
    modal_buscar_profissional.show();
}

function buscarProfissional() {
    let filterField = document.getElementById("filter_profissional").value
    let filterValue = document.getElementById("filter_value_profissional").value.trim()
    const params = new URLSearchParams()

    if (filterValue) {
        params.append("filter_type", filterField)
        params.append("filter_value", filterValue)
    }

    getData(`/api/profissionais/?${params.toString()}`, (data) => {
        renderProfissionais(data.results)
    })
}

function renderProfissionais(profissionais = []) {
    let container = document.getElementById("profissionais_table")
    container.innerHTML = ""

    if (profissionais.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                Nenhum profissional encontrado.
            </div>
        `
        return;
    }

    let html = ""

    profissionais.forEach(profissional => {
        const telefoneLimpo = profissional.telefone.replace(/\D/g, "");

        html += `
            <tr class="text-center">
                <td>${profissional.nome}</td>
                <td>${profissional.cpf}</td>
                <td>
                    ${profissional.telefone}
                    <a href="https://wa.me/55${telefoneLimpo}" target="_blank" class="text-success text-decoration-none">
                        <i class="bi bi-whatsapp btn-modern"></i>
                    </a>
                </td>
                <td>${profissional.nascimento.split("T")[0].split("-").reverse().join("/")}</td>
                <td>
                    <button class="btn btn-modern" onclick="selecionarProfissional(${profissional.id}, '${profissional.nome}')">
                        Selecionar
                    </button>
                </td>
            </tr>
        `
    })

    container.innerHTML = html
}

function selecionarProfissional(id, nome) {
    document.getElementById("profissional").value = nome
    document.getElementById("profissional_id").value = id
    document.getElementById("edit_profissional_nome").value = nome
    document.getElementById("edit_profissional").value = id
    modal_buscar_profissional.hide()
}

// ###################################
// ########### PLANTÕES ##############
// ###################################

function criarPlantoesLote() {
    const assistido = document.getElementById("assistido_id").value;
    const profissional = document.getElementById("profissional_id").value;
    const inicio = document.getElementById("hora_inicio").value;
    const fim = document.getElementById("hora_fim").value;
    const regra_pagamento = document.getElementById("select_regra").value;

    if (!assistido || !profissional) {
        showToast("Selecione assistido e profissional", "danger");
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

    if (!regra_pagamento) {
        showToast("Selecione uma regra de pagamento", "danger");
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
            assistido: assistido,
            profissional: profissional,
            regra_pagamento: regra_pagamento,
        };
    });

    saveData("/api/plantao/lote/", { plantoes }, () => {
        showToast("Plantoes criados com sucesso", "success");
        datasSelecionadas.clear();
        atualizarCalendarioVisual();
        buscarPlantoes(assistido);
    });
}

function buscarPlantoes(assistido_id) {
    getData(`/api/plantao/?assistido=${assistido_id}`, (data) => {
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

        const finalizado = p.status === 'F'; // verde
        const expirado = p.status === 'E';   // vermelho
        const andamento = p.status === 'R';  // azul

        let backgroundColor;
        let borderColor;
        let classNames = [];
        let titulo = "";

        if (finalizado) {
            backgroundColor = "#199c14";
            borderColor = "#199c14";
            classNames.push('evento-finalizado');
            titulo = "Plantão Finalizado";
        } else if (expirado) {
            backgroundColor = "#a01a1a";
            borderColor = "#a01a1a";
            classNames.push('evento-expirado');
            titulo = "Plantão Expirado";
        } else if (andamento) {
            backgroundColor = "#1a69c4";
            borderColor = "#1a69c4";
            classNames.push('evento-andamento');
            titulo = "Plantão em Andamento";
        }

        return {
            id: String(p.id),
            start: p.inicio,
            end: p.fim,
            allDay: false,

            title: isMobile
                ? `${horaInicio}-${horaFim}`
                : `${p.profissional_nome} (${horaInicio} - ${horaFim})`,

            backgroundColor,
            borderColor,
            classNames,
            titulo,

            extendedProps: {
                horaInicio,
                horaFim,
                profissional: p.profissional_nome,
                profissional_id: p.profissional,
                status: p.status,
                titulo: titulo,
                regra_pagamento: p.regra_pagamento,
                horas_cumpridas: p.horas_cumpridas
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

        let nome = arg.event.extendedProps.profissional.length > 15 ? arg.event.extendedProps.profissional.substring(0, 15) + "..." : arg.event.extendedProps.profissional;

        return {
            html: `
            <div title="${arg.event.extendedProps.titulo}">
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

    document.getElementById("edit_status").value = event.extendedProps.status;

    document.getElementById("edit_id").value = event.id;

    document.getElementById("edit_inicio").value =
        inicio.toTimeString().slice(0, 5);

    document.getElementById("edit_fim").value =
        fim.toTimeString().slice(0, 5);

    document.getElementById("edit_profissional_nome").value = event.extendedProps.profissional;
    document.getElementById("edit_profissional").value = event.extendedProps.profissional_id;

    document.getElementById("edit_regra_pagamento").value = event.extendedProps.regra_pagamento;
    document.getElementById("edit_horas_cumpridas").value = event.extendedProps.horas_cumpridas;

    modalEditarPlantao.show();
}

function patchPlantao() {
    const id = document.getElementById("edit_id").value;
    const inicio = document.getElementById("edit_inicio").value;
    const fim = document.getElementById("edit_fim").value;
    const status = document.getElementById("edit_status").value;
    const profissional = document.getElementById("edit_profissional").value;
    const regra_pagamento = document.getElementById("edit_regra_pagamento").value;
    const horas_cumpridas = document.getElementById("edit_horas_cumpridas").value;

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
        profissional: profissional,
        status: status,
        regra_pagamento: regra_pagamento,
        horas_cumpridas: horas_cumpridas
    };

    saveData(`/api/plantao/${id}/`, payload, () => {
        showToast("Atualizado com sucesso", "success");
        modalEditarPlantao.hide();

        buscarPlantoes(document.getElementById("assistido_id").value);

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
            "profissional",
            document.getElementById("edit_profissional_nome").value
        );
    }, "PATCH");

}

function deletarPlantao() {
    const id = document.getElementById("edit_id").value;

    if (!confirm("Deseja realmente deletar este plantão?")) {
        return;
    }

    deleteData(`/api/plantao/${id}/`, () => {
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

    const assistidoNome = document.getElementById("assistido").value || "Assistido";

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
            nome: p.profissional_nome
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
    pdf.text(`Assistido: ${assistidoNome}`, 10, 28);

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

    pdf.save(`escala_${assistidoNome}.pdf`);
}

// ###################################
// ########### ESCALAS #############
// ###################################

function buscarRegraPagamento() {
    getData("/api/regra-pagamento/", (data) => {
        renderRegrasPagamentoSelect(data.results)
    })
}

function renderRegrasPagamentoSelect(regras) {
    const select = document.getElementById("select_regra");

    select.innerHTML = "<option value=''>Selecione uma regra de pagamento</option>";

    regras.forEach(regra => {
        const option = document.createElement("option");
        option.value = regra.id;
        option.textContent = `${regra.nome} (${Number(regra.valor_base).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`;
        select.appendChild(option);
    });

    const selectEdit = document.getElementById("edit_regra_pagamento");

    selectEdit.innerHTML = "<option value=''>Selecione uma regra de pagamento</option>";

    regras.forEach(regra => {
        const option = document.createElement("option");
        option.value = regra.id;
        option.textContent = `${regra.nome} (${Number(regra.valor_base).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`;
        selectEdit.appendChild(option);
    });
}