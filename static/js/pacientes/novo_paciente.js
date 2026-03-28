let novoPacienteModal;

document.addEventListener("DOMContentLoaded", function () {
    novoPacienteModal = new bootstrap.Modal(document.getElementById("novoPacienteModal"));
});

document.getElementById("novoPacienteBtn").addEventListener("click", abrirModalNovoPaciente);


document.getElementById("cep").addEventListener("blur", function () {
    const cep = this.value.replace("-", "");
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("endereco").value = data.logradouro;
                document.getElementById("cidade").value = data.localidade;
                document.getElementById("estado").value = data.uf;
            })
            .catch(error => console.error("Erro ao buscar CEP:", error));
    }
});

function abrirModalNovoPaciente() {
    novoPacienteModal.show();
}

function fecharModalNovoPaciente() {
    novoPacienteModal.hide();
}

document.getElementById("saveNovoPacienteBtn").addEventListener("click", salvarNovoPaciente);


function salvarNovoPaciente() {
    const nome = document.getElementById("nome").value;
    const idade = document.getElementById("idade").value;
    const sexo = document.getElementById("sexo").value;
    const cep = document.getElementById("cep").value;
    const endereco = document.getElementById("endereco").value;
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;
    const observacoes = document.getElementById("observacoes").value;

    const paciente = {
        nome: nome,
        idade: idade,
        sexo: sexo,
        cep: cep,
        endereco: endereco,
        cidade: cidade,
        estado: estado,
        observacoes: observacoes
    };

    postNovoPaciente(paciente);
    location.reload();
}


function postNovoPaciente(paciente) {
    showLoader();
    fetch("/api/pacientes/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(paciente)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            fecharModalNovoPaciente();
            showToast("Paciente salvo com sucesso!", "success");
        })
        .catch(error => {
            console.error("Erro ao salvar paciente:", error);
            showToast("Erro ao salvar paciente!", "error");
        })
        .finally(() => {
            hideLoader();
        });
}