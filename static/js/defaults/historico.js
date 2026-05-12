let historicoModal

document.addEventListener('DOMContentLoaded', function () {
    historicoModal = new bootstrap.Modal(document.getElementById('historicoModal'))
})

function openHistoricoModal(id) {
    const list = document.getElementById('historicoList')
    const loading = document.getElementById('historico-loading')

    list.innerHTML = ''
    loading.classList.remove('d-none')

    historicoModal.show()

    fetch(`/api/historico-plantao/?plantao_id=${id}`)
        .then(res => res.json())
        .then(res => {
            loading.classList.add('d-none')
            console.log(res)
            if (res.length === 0) {
                list.innerHTML = `
                    <div class="text-center text-muted py-3">
                        Nenhum histórico encontrado
                    </div>
                `
                return
            }

            // const historico = [...res.data].reverse()
            const historico = [...res]

            historico.forEach((item, index) => {

                const side = index % 2 === 0 ? 'left' : 'right'

                list.insertAdjacentHTML('beforeend', `
                    <div class="timeline-item ${side}">
                        <div class="content">
                            <span>
                                <span class="fw-bold text-dark badge bg-primary-subtle">${item.usuario ?? 'Sistema'}</span> - 
                                <small class="text-muted">${maskDateBR(item.created_at)} </small>
                            </span>

                            ${item.status_name ? `
                                <hr>
                                <div class="text-muted fw-bold mt-2">
                                    ${item.status_name.toUpperCase()}
                                </div>
                            ` : ''}

                            ${item.observacoes ? `
                                <hr>
                                <div class="small mt-2">
                                    ${item.observacoes}
                                </div>
                            ` : ''}

                        </div>
                    </div>
                `)
            })
        })
        .catch(error => {
            console.error(error)
            loading.classList.add('d-none')
            list.innerHTML = `
                <div class="text-center text-danger py-3">
                    Erro de conexão
                </div>
            `
        })
}
