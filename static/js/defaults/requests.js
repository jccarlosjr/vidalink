function getData(url, renderFunction = null) {
    showLoader();
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        }
    })
        .then(response => response.json())
        .then(data => {
            if (renderFunction) {
                renderFunction(data);
            }
            return data;
        })
        .catch(error => {
            console.error("Erro ao buscar dados:", error);
            hideLoader();
        })
        .finally(() => {
            hideLoader();
        });
}

function saveData(url, data, callBack = null, method = "POST") {
    showLoader();

    return fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(data)
    })
        .then(async response => {
            const responseData = await response.json();

            if (!response.ok) {
                throw responseData;
            }

            return responseData;
        })
        .then(data => {
            if (callBack) {
                callBack(data);
            }
            return data;
        })
        .catch(error => {
            console.error("Erro ao salvar dados:", error);

            if (typeof error === "object") {
                let messages = [];

                for (let field in error) {
                    messages.push(`${field}: ${error[field].join(", ")}`);
                }

                showToast(messages.join("<br>"), "danger");
            } else {
                showToast("Erro ao salvar dados!", "danger");
            }
        })
        .finally(() => {
            hideLoader();
        });
}

function deleteData(url, callBack = null) {
    showLoader();

    return fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        }
    })
        .then(async response => {
            let responseData = null;

            try {
                const text = await response.text();
                responseData = text ? JSON.parse(text) : null;
            } catch {
                responseData = null;
            }

            if (!response.ok) {
                throw responseData || { error: "Erro ao deletar registro." };
            }

            return responseData;
        })
        .then(data => {
            showToast("Registro excluído com sucesso!", "success");

            if (callBack) {
                callBack(data);
            }

            return data;
        })
        .catch(error => {
            console.error("Erro ao deletar:", error);

            if (typeof error === "object") {
                let messages = [];

                for (let field in error) {
                    messages.push(`${field}: ${error[field].join(", ")}`);
                }

                showToast(messages.join("<br>"), "danger");
            } else {
                showToast("Erro ao deletar registro!", "danger");
            }
        })
        .finally(() => {
            hideLoader();
        });
}

function patchData(url, data, callBack = null) {
    showLoader();

    return fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(data)
    })
        .then(async response => {
            const responseData = await response.json();

            if (!response.ok) {
                throw responseData;
            }

            return responseData;
        })
        .then(data => {
            showToast("Atualizado com sucesso!", "success");

            if (callBack) {
                callBack(data);
            }

            return data;
        })
        .catch(error => {
            console.error("Erro ao atualizar:", error);

            if (typeof error === "object") {
                let messages = [];

                for (let field in error) {
                    messages.push(`${field}: ${error[field].join(", ")}`);
                }

                showToast(messages.join("<br>"), "danger");
            } else {
                showToast("Erro ao atualizar dados!", "danger");
            }
        })
        .finally(() => {
            hideLoader();
        });
}