function showLoader() {
    document.getElementById('global-loader').classList.remove('d-none');
}

function hideLoader() {
    document.getElementById('global-loader').classList.add('d-none');
}


function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value
}

function showToast(message, type = 'danger') {
    const container = document.getElementById('toastContainer')

    const toastEl = document.createElement('div')
    toastEl.className = `toast text-bg-${type} border-0`
    toastEl.role = 'alert'

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white ms-auto"
                    data-bs-dismiss="toast"></button>
        </div>
    `

    container.appendChild(toastEl)

    const toast = new bootstrap.Toast(toastEl, { delay: 4000 })
    toast.show()

    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
}

function formatCPF(input) {
    let cpf = input.value.replace(/\D/g, "");
    if (cpf.length > 3 && cpf.length <= 6) {
        cpf = cpf.slice(0, 3) + "." + cpf.slice(3);
    } else if (cpf.length > 6 && cpf.length <= 9) {
        cpf = cpf.slice(0, 3) + "." + cpf.slice(3, 6) + "." + cpf.slice(6);
    } else if (cpf.length > 9) {
        cpf =
            cpf.slice(0, 3) +
            "." +
            cpf.slice(3, 6) +
            "." +
            cpf.slice(6, 9) +
            "-" +
            cpf.slice(9, 11);
    }
    input.value = cpf;
}

function cleanCPF(value) {
    return value.replace(/\D/g, "");
}

function formatCelphone(input) {
    let cel = input.value.replace(/\D/g, "");
    if (cel.length > 2 && cel.length <= 6) {
        cel = "(" + cel.slice(0, 2) + ")" + cel.slice(2);
    } else if (cel.length > 6 && cel.length <= 10) {
        cel = "(" + cel.slice(0, 2) + ")" + cel.slice(2, 6) + "-" + cel.slice(6);
    } else if (cel.length > 10) {
        cel =
            "(" + cel.slice(0, 2) + ")" + cel.slice(2, 7) + "-" + cel.slice(7, 11);
    }
    input.value = cel;
}

function formatCEP(input) {
    let cep = input.value.replace(/\D/g, "");
    if (cep.length > 2 && cep.length <= 5) {
        cep = cep.slice(0, 2) + "." + cep.slice(2);
    } else if (cep.length > 5) {
        cep = cep.slice(0, 2) + "." + cep.slice(2, 5) + "-" + cep.slice(5, 8);
    }
    input.value = cep;
}

function formatNumbersOnly(input) {
    input.value = input.value.replace(/\D/g, "");
}

function floatFormat(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length >= 2) {
        const decimalPart = value.slice(-2);
        const integerPart = value.slice(0, -2);

        input.value = `${integerPart}.${decimalPart}`;
    } else {
        input.value = value;
    }
}

function maskCPF(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskCelphone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{4})$/, '$1-$2');
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('pt-BR')
}

function maskData(dataISO) {
    if (!dataISO) return '';

    const partes = dataISO.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function maskCEP(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d{3})$/, '$1-$2');
}

function maskDateBR(isoString) {
    if (!isoString) return null;

    const date = new Date(isoString);

    const pad = (n) => String(n).padStart(2, '0');

    const dia = pad(date.getDate());
    const mes = pad(date.getMonth() + 1);
    const ano = date.getFullYear();

    const hora = pad(date.getHours());
    const min = pad(date.getMinutes());

    return `${dia}/${mes}/${ano} - ${hora}:${min}`;
}

document.querySelectorAll('.numbers-only').forEach(input => {
    input.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, "");
    });
});


document.querySelectorAll(".cep-mask").forEach(input => {
    input.addEventListener("input", function () {
        this.value = maskCEP(this.value);
    });
});

document.querySelectorAll(".celphone-mask").forEach(input => {
    input.addEventListener("input", function () {
        this.value = maskCelphone(this.value);
    });
});

