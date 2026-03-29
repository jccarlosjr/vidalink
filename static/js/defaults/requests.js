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
        .then(response => response.json())
        .then(data => {
            if (callBack) {
                callBack();
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

function deleteData(url, callBack = null) {
    showLoader();

    return fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro na requisição");
            }

            return response.text().then(text => {
                return text ? JSON.parse(text) : null;
            });
        })
        .then(data => {
            if (callBack) {
                callBack();
            }
            return data;
        })
        .catch(error => {
            console.error("Erro ao buscar dados:", error);
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
        .then(response => response.json())
        .then(data => {
            if (callBack) {
                callBack();
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
